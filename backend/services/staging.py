from backend.api.types import Decision, Guardrails


def validate_decision(
    decision: Decision,
    candidates: list[dict],
    roster: list[dict],
    guardrails: Guardrails,
    budget: int,
) -> tuple[Decision, dict | None]:
    """Model output is advisory. Deterministic code enforces all transaction rules."""
    candidates_by_id = {c["player"]["id"]: c for c in candidates}
    roster_by_id = {p["id"]: p for p in roster}
    seen = set()
    for v in decision.verdicts:
        if v.player_id not in candidates_by_id or v.player_id in seen:
            raise ValueError("Model returned an unknown or duplicate candidate.")
        seen.add(v.player_id)
        c = candidates_by_id[v.player_id]
        measured = {
            m["name"] for m in c["metrics"] if m["value"] is not None and m["evidence_frames"]
        }
        if not set(v.metric_refs).issubset(measured):
            raise ValueError("Verdict references an unavailable or unknown metric.")
        v.confidence = min(v.confidence, c["quality"])
        if v.verdict == "ADD" and (
            not v.metric_refs
            or not c.get("verified")
            or c["quality"] < 0.75
            or v.confidence < guardrails.min_confidence
        ):
            v.verdict = "MONITOR"
            v.weaknesses.append(
                "ADD withheld: verified film evidence or confidence threshold not met."
            )
    if seen != set(candidates_by_id):
        raise ValueError("Decision must cover every shortlisted candidate.")
    move = decision.move
    if move is None:
        return decision, None
    v = next((v for v in decision.verdicts if v.player_id == move.add_player_id), None)
    if (
        v is None
        or v.verdict != "ADD"
        or move.drop_player_id not in roster_by_id
        or move.drop_player_id in guardrails.protected_players
        or move.add_player_id in roster_by_id
    ):
        decision.move = None
        return decision, None
    # Clamp rather than exceed either the user's guardrail or remaining league budget.
    move.faab_bid = min(move.faab_bid, guardrails.max_faab_bid, budget)
    staged = {
        **move.model_dump(),
        "add_player": candidates_by_id[move.add_player_id]["player"],
        "drop_player": roster_by_id[move.drop_player_id],
        "status": "Awaiting your tap",
        "guardrails_checked": True,
        "executed": False,
    }
    return decision, staged
