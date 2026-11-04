"""Durable single-job worker with atomic leases and replay-safe checkpoints.

Run as a separate process. HTTP requests enqueue jobs; they never run inference.
Expired leases are claimable after a crash. Model and segmentation caches survive
process restarts. A timed-out external request may have been billed; we do not
automatically retry paid network calls within one operation.
"""

import argparse
from hashlib import sha256
import json
import logging
import time
from uuid import uuid4

from sqlalchemy import select, update

from backend.agents.critic import PerceptionCritic
from backend.agents.decision import DecisionAgent
from backend.agents.scout import ScoutAgent
from backend.api.types import ClipVerification, Criticism, Tracking
from backend.config import settings
from backend.db.database import Session, initialize, session_scope
from backend.db.schema import (
    CalculatedMetric,
    JobEvent,
    ModelCache,
    ModelCall,
    PerceptionLog,
    ScanRun,
    SegmentationResult,
    StagedMove,
    Verdict,
    now,
)
from backend.models.base import ModelError
from backend.models.mock import MockSAM, MockSpark
from backend.services.clips import LocalClipProvider, players_with_permitted_clips
from backend.services.metrics import calculate_metrics
from backend.services.overlays import create_overlays
from backend.services.state import get_guardrails, get_league, seed_demo
from backend.services.tape_card import render_card

log = logging.getLogger("tapegrade.worker")
TERMINAL = ("COMPLETED", "FAILED")


def enqueue(instruction, source="manual", request_key=None, factory=None):
    with session_scope(factory) as s:
        if request_key:
            existing = s.scalar(select(ScanRun).where(ScanRun.request_key == request_key))
            if existing:
                return existing.id
        league = get_league(factory)
        if not settings.mock_models:
            available = players_with_permitted_clips(league, factory)
            if not available:
                raise ModelError(
                    f"Upload a permitted clip (up to {settings.max_clip_seconds} seconds) in Film library before starting a live scan. No API credits were used."
                )
            league = {**league, "available": available}
        run = ScanRun(
            league_id="demo-nba",
            instruction=instruction,
            mode="mock" if settings.mock_models else "live",
            source=source,
            request_key=request_key,
            checkpoint={
                "league": league,
                "candidates": [],
                "max_candidates": settings.max_candidates,
                "max_sam_retries": settings.max_sam_retries,
            },
        )
        s.add(run)
        s.flush()
        s.add(
            JobEvent(
                scan_id=run.id,
                stage="QUEUED",
                actor="TapeGrade",
                message="Scan queued for the separate worker.",
            )
        )
        return run.id


def claim(factory=None):
    token = uuid4().hex
    with session_scope(factory) as s:
        eligible = (ScanRun.stage.notin_(TERMINAL), ScanRun.lease_until < time.time())
        run = s.scalar(select(ScanRun).where(*eligible).order_by(ScanRun.created_at).limit(1))
        if not run:
            return None
        result = s.execute(
            update(ScanRun)
            .where(ScanRun.id == run.id, *eligible)
            .values(
                worker_token=token,
                lease_until=time.time() + settings.job_lease_seconds,
                attempts=ScanRun.attempts + 1,
            )
        )
        return (run.id, token) if result.rowcount == 1 else None


class Job:
    def __init__(self, scan_id, token, factory=None):
        self.id, self.token, self.factory = scan_id, token, factory
        with session_scope(factory) as s:
            run = s.get(ScanRun, scan_id)
            self.mode, self.instruction, self.cp = run.mode, run.instruction, dict(run.checkpoint)

    def heartbeat(self):
        with session_scope(self.factory) as s:
            result = s.execute(
                update(ScanRun)
                .where(ScanRun.id == self.id, ScanRun.worker_token == self.token)
                .values(lease_until=time.time() + settings.job_lease_seconds, updated_at=now())
            )
            if result.rowcount != 1:
                raise ModelError("Worker lease lost; this process stopped safely.")

    def event(self, stage, actor, message, progress=None, detail=None):
        self.heartbeat()
        with session_scope(self.factory) as s:
            run = s.get(ScanRun, self.id)
            run.stage, run.updated_at = stage, now()
            if progress is not None:
                run.progress = progress
            s.add(
                JobEvent(
                    scan_id=self.id, stage=stage, actor=actor, message=message, detail=detail or {}
                )
            )

    def save(self):
        self.heartbeat()
        with session_scope(self.factory) as s:
            s.get(ScanRun, self.id).checkpoint = json.loads(json.dumps(self.cp))

    def reserve_call(self, model, operation):
        self.heartbeat()
        with session_scope(self.factory) as s:
            run = s.get(ScanRun, self.id)
            limit = (
                min(settings.max_live_model_calls_per_scan, self.cp.get("film_call_limit", 4))
                if self.cp.get("film_test")
                else settings.max_live_model_calls_per_scan
            )
            if run.live_calls >= limit:
                raise ModelError(
                    "Live model call budget reached. Reduce candidates or increase the explicit scan budget."
                )
            run.live_calls += 1

    def cached(self, model, operation, payload, call):
        key = sha256(
            json.dumps(
                {
                    "version": 2,
                    "mode": self.mode,
                    "model": model,
                    "operation": operation,
                    "payload": payload,
                },
                sort_keys=True,
            ).encode()
        ).hexdigest()
        with session_scope(self.factory) as s:
            hit = s.get(ModelCache, key)
            if hit:
                s.add(
                    JobEvent(
                        scan_id=self.id,
                        stage=s.get(ScanRun, self.id).stage,
                        actor=model,
                        message=f"{operation}: reused cached output.",
                        detail={"cache_key": key},
                    )
                )
                return hit.data
        self.heartbeat()
        if self.mode == "live":
            self.reserve_call(model, operation)
        start = time.monotonic()
        try:
            data = call()
        except Exception:
            with session_scope(self.factory) as s:
                s.add(
                    ModelCall(
                        scan_id=self.id,
                        model=model,
                        operation=operation,
                        status="failed",
                        duration_ms=int((time.monotonic() - start) * 1000),
                    )
                )
            raise
        with session_scope(self.factory) as s:
            if not s.get(ModelCache, key):
                s.add(ModelCache(key=key, mode=self.mode, model=model, data=data))
            s.add(
                ModelCall(
                    scan_id=self.id,
                    model=model,
                    operation=operation,
                    status="simulated" if self.mode == "mock" else "completed",
                    duration_ms=int((time.monotonic() - start) * 1000),
                )
            )
        return data


class CachedSpark:
    def __init__(self, job, raw):
        self.job, self.raw = job, raw

    def reason(self, operation, payload, schema, images=None):
        model = settings.spark_model
        data = self.job.cached(
            model,
            operation,
            {
                "input": payload,
                "images": images or [],
                "schema": schema.model_json_schema(),
                "inference_config": {
                    "max_completion_tokens": settings.spark_max_completion_tokens,
                    "reasoning_effort": settings.spark_reasoning_effort,
                },
            },
            lambda: self.raw.reason(operation, payload, schema, images).model_dump(),
        )
        return schema.model_validate(data)


def process(scan_id, token, factory=None):
    job = Job(scan_id, token, factory)
    mock = job.mode == "mock"
    try:
        if mock != settings.mock_models:
            raise ModelError(
                "Job model mode differs from worker configuration. Restart with the original mode or create a new scan."
            )
        if job.cp.get("film_test"):
            from backend.worker.film import process_film

            process_film(job)
            return
        if mock:
            raw_spark, sam, image = MockSpark(), MockSAM(), None
        else:
            from backend.models.muse_spark import MuseSpark
            from backend.models.sam import SAMClient
            from backend.models.muse_image import MuseImage

            raw_spark, sam, image = MuseSpark(), SAMClient(), MuseImage(job)
        spark = CachedSpark(job, raw_spark)
        league = job.cp["league"]
        if "shortlist" not in job.cp:
            job.event(
                "SCOUTING",
                "Muse Spark",
                "Evaluating roster needs, position fit and opportunity signals.",
                5,
            )
            job.cp["shortlist"] = (
                ScoutAgent(spark)
                .shortlist(job.instruction, league, job.cp["max_candidates"])
                .model_dump()
            )
            job.save()
        shortlist = job.cp["shortlist"]["player_ids"]
        completed_ids = {c["player"]["id"] for c in job.cp["candidates"]}
        for index, pid in enumerate(shortlist):
            if pid in completed_ids:
                continue
            player = next(p for p in league["available"] if p["id"] == pid)
            progress = 12 + int(index / max(1, len(shortlist)) * 60)
            job.event(
                "FINDING_CLIPS",
                "TapeGrade",
                f"Selecting permitted local footage for {player['name']}.",
                progress,
            )
            clip = LocalClipProvider(mock, factory).find(pid)
            candidate = {
                "player": player,
                "clip": clip,
                "verified": False,
                "quality": 0,
                "tracking": None,
                "metrics": [],
                "critiques": [],
                "overlays": [],
            }
            if not clip:
                job.event(
                    "FINDING_CLIPS",
                    "TapeGrade",
                    "No permitted clip available; film metrics will be unavailable.",
                )
            else:
                job.event(
                    "VERIFYING",
                    "Muse Spark",
                    f"Checking whether the selected clip features {player['name']}.",
                )
                verification = spark.reason(
                    "verify",
                    {
                        "player": player,
                        "clip": clip,
                        "instruction": "Verify identity only from visible jersey/name/number and supplied context. Reject if identity is uncertain. Return frame-0 seed boxes in source pixels: target id 1, visible opposing defenders id 2+, ball id 15. Never invent unseen objects.",
                    },
                    ClipVerification,
                    [f["url"] for f in clip["frames"]],
                )
                candidate["verification"] = verification.model_dump()
                candidate["verified"] = verification.verified and verification.confidence >= 0.75
                if not candidate["verified"]:
                    job.event("VERIFYING", "Muse Spark", f"Clip rejected: {verification.reason}")
                else:
                    prompt = verification.target_description
                    objects = [o.model_dump() for o in verification.objects]
                    if not mock and not any(o["role"] == "target" for o in objects):
                        raise ModelError(
                            "Verified clip has no target seed box. Add clearer footage."
                        )
                    if not mock:
                        from backend.models.sam import seed_prompt

                        prompt = seed_prompt(clip, objects)
                    for attempt in range(job.cp["max_sam_retries"] + 1):
                        job.event(
                            "TRACKING",
                            "SAM 3.1",
                            f"{'Retrying tracking' if attempt else 'Tracking clip'} · {player['name']} · attempt {attempt+1}.",
                            detail={"prompt": prompt, "attempt": attempt, "simulated": mock},
                        )
                        track_payload = {
                            "clip_hash": clip["content_hash"],
                            "prompt": prompt,
                            "objects": objects,
                            "mask_encoding": "one_bit",
                        }
                        track_data = job.cached(
                            settings.sam_model,
                            "tracking",
                            track_payload,
                            lambda: sam.track(clip, prompt, objects).model_dump(),
                        )
                        tracking = Tracking.model_validate(track_data)
                        seg_key = sha256(
                            json.dumps(
                                {"mode": job.mode, "model": settings.sam_model, **track_payload},
                                sort_keys=True,
                            ).encode()
                        ).hexdigest()
                        with session_scope(factory) as s:
                            if not s.scalar(
                                select(SegmentationResult).where(
                                    SegmentationResult.cache_key == seg_key
                                )
                            ):
                                s.add(
                                    SegmentationResult(
                                        cache_key=seg_key,
                                        clip_id=clip["id"],
                                        model=settings.sam_model,
                                        mode=job.mode,
                                        data=track_data,
                                    )
                                )
                        overlays = create_overlays(clip, tracking, seg_key)
                        job.event(
                            "CRITIQUING",
                            "Muse Spark",
                            "Inspecting source frames and tracking overlays for identity swaps and mask errors.",
                        )
                        # Raw frames plus overlays allow the critic to compare evidence directly.
                        critique = PerceptionCritic(spark).inspect(
                            pid, attempt, tracking, [f["url"] for f in clip["frames"]] + overlays
                        )
                        candidate["critiques"].append(
                            {"attempt": attempt, "prompt": prompt, **critique.model_dump()}
                        )
                        with session_scope(factory) as s:
                            row = s.scalar(
                                select(PerceptionLog).where(
                                    PerceptionLog.scan_id == scan_id,
                                    PerceptionLog.player_id == pid,
                                    PerceptionLog.attempt == attempt,
                                )
                            )
                            if row:
                                row.data = candidate["critiques"][-1]
                            else:
                                s.add(
                                    PerceptionLog(
                                        scan_id=scan_id,
                                        player_id=pid,
                                        attempt=attempt,
                                        data=candidate["critiques"][-1],
                                    )
                                )
                        candidate.update(
                            quality=min(critique.quality_score, verification.confidence),
                            tracking=track_data,
                            overlays=overlays,
                        )
                        retry = (
                            critique.quality_score < settings.perception_quality_threshold
                            and critique.retry_justified
                            and attempt < job.cp["max_sam_retries"]
                        )
                        changed = (
                            bool(critique.refined_prompt.strip())
                            and critique.refined_prompt.strip() != prompt
                        )
                        if retry and changed:
                            job.event(
                                "CRITIQUING",
                                "Muse Spark",
                                f"Tracking quality insufficient ({critique.quality_score:.0%}). {critique.explanation}",
                                detail=critique.model_dump(),
                            )
                            prompt = critique.refined_prompt.strip()
                            continue
                        accepted = critique.quality_score >= settings.perception_quality_threshold
                        job.event(
                            "CRITIQUING",
                            "Muse Spark",
                            f"{'Updated tracking accepted' if attempt and accepted else 'Tracking accepted' if accepted else 'Tracking remains unreliable; recommendation confidence reduced'} ({critique.quality_score:.0%}).",
                            detail=critique.model_dump(),
                        )
                        break
            job.event(
                "CALCULATING_METRICS",
                "TapeGrade",
                f"Calculating evidence-backed proxies for {player['name']}.",
            )
            tracking = (
                Tracking.model_validate(candidate["tracking"])
                if candidate["tracking"]
                else Tracking(width=1, height=1, fps=1, prompt="", frames=[], simulated=mock)
            )
            candidate["metrics"] = [
                m.model_dump() for m in calculate_metrics(tracking, candidate["quality"])
            ]
            with session_scope(factory) as s:
                for m in candidate["metrics"]:
                    row = s.scalar(
                        select(CalculatedMetric).where(
                            CalculatedMetric.scan_id == scan_id,
                            CalculatedMetric.player_id == pid,
                            CalculatedMetric.name == m["name"],
                        )
                    )
                    if row:
                        row.data = m
                    else:
                        s.add(
                            CalculatedMetric(scan_id=scan_id, player_id=pid, name=m["name"], data=m)
                        )
            job.cp["candidates"].append(candidate)
            job.save()
        job.event(
            "DECIDING",
            "Muse Spark",
            "Combining stored film metrics, sample statistics and roster guardrails.",
            80,
        )
        candidates = job.cp["candidates"]
        decision, staged = DecisionAgent(spark).decide(
            job.instruction, league, candidates, get_guardrails(factory)
        )
        for c in candidates:
            c["verdict"] = next(
                v.model_dump() for v in decision.verdicts if v.player_id == c["player"]["id"]
            )
        job.cp["candidates"] = candidates
        job.save()
        job.event(
            "GENERATING_CARD",
            "Muse Image" if not mock else "TapeGrade",
            (
                "Generating scouting artwork and compositing verified typography."
                if not mock
                else "Rendering a clearly labeled mock Tape Card."
            ),
            92,
        )
        card, card_error = None, None
        if candidates and (mock or any(c["verified"] for c in candidates)):
            best = next(
                (c for c in candidates if staged and c["player"]["id"] == staged["add_player_id"]),
                candidates[0],
            )
            try:
                card = render_card(
                    best["player"],
                    best["verdict"],
                    best["metrics"],
                    best["clip"] if best["verified"] else None,
                    mock,
                    image,
                )
                card["player_id"] = best["player"]["id"]
            except ModelError as e:
                card_error = str(e)
                job.event("GENERATING_CARD", "Muse Image", f"Card unavailable: {e}")
        elif candidates:
            card_error = "No verified film; image generation skipped to preserve the API budget."
            job.event("GENERATING_CARD", "TapeGrade", card_error)
        # Re-check the latest settings after slow image generation.
        from backend.services.staging import validate_decision

        decision, staged = validate_decision(
            decision,
            candidates,
            league["roster"],
            get_guardrails(factory),
            league["faab_remaining"],
        )
        result = {
            "candidates": candidates,
            "shortlist": job.cp["shortlist"],
            "staged_move": staged,
            "card": card,
            "card_error": card_error,
            "simulated": mock,
            "league_is_demo": True,
        }
        job.heartbeat()
        with session_scope(factory) as s:
            for c in candidates:
                existing = s.scalar(
                    select(Verdict).where(
                        Verdict.scan_id == scan_id, Verdict.player_id == c["player"]["id"]
                    )
                )
                if existing:
                    existing.data = c["verdict"]
                else:
                    s.add(Verdict(scan_id=scan_id, player_id=c["player"]["id"], data=c["verdict"]))
            move_row = s.scalar(select(StagedMove).where(StagedMove.scan_id == scan_id))
            if staged and not move_row:
                s.add(StagedMove(scan_id=scan_id, data=staged))
            run = s.get(ScanRun, scan_id)
            run.result, run.stage, run.progress, run.error, run.lease_until = (
                result,
                "COMPLETED",
                100,
                None,
                0,
            )
            run.updated_at = now()
            s.add(
                JobEvent(
                    scan_id=scan_id,
                    stage="COMPLETED",
                    actor="TapeGrade",
                    message="Scan complete. Any transaction is a recommendation only.",
                )
            )
        from backend.services.notifications import notify

        notify(scan_id, result)
    except Exception as e:
        # Never send raw HTTP exceptions (which can carry credential-bearing bodies) to the UI.
        message = (
            str(e)
            if isinstance(e, (ModelError, ValueError))
            else f"{type(e).__name__}: scan failed; see local worker logs."
        )
        log.error("Scan %s failed (%s)", scan_id, type(e).__name__)
        with session_scope(factory) as s:
            run = s.get(ScanRun, scan_id)
            if run.worker_token == token:
                run.stage, run.error, run.lease_until, run.updated_at = "FAILED", message, 0, now()
                s.add(JobEvent(scan_id=scan_id, stage="FAILED", actor="TapeGrade", message=message))


def run_once(factory=None):
    claimed = claim(factory)
    if claimed:
        process(*claimed, factory)
    return bool(claimed)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    initialize()
    seed_demo()
    if args.once:
        run_once()
        return
    from backend.worker.scheduler import start_scheduler

    scheduler = start_scheduler()
    log.info(
        "Worker started · %s models · scheduler %s",
        "mock" if settings.mock_models else "live",
        bool(scheduler),
    )
    try:
        while True:
            if not run_once():
                time.sleep(settings.worker_poll_seconds)
    except KeyboardInterrupt:
        if scheduler:
            scheduler.shutdown(wait=False)


if __name__ == "__main__":
    main()
