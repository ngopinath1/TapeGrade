from backend.api.types import Criticism


class PerceptionCritic:
    def __init__(self, spark):
        self.spark = spark

    def inspect(self, player_id, attempt, tracking, overlays, seed_objects=None):
        return self.spark.reason(
            "critic",
            {
                "player_id": player_id,
                "attempt": attempt,
                "prompt": tracking.prompt,
                "width": tracking.width,
                "height": tracking.height,
                "verified_seed_objects": seed_objects or [],
                "frames": [
                    f.model_dump() for f in tracking.frames[:: max(1, len(tracking.frames) // 5)]
                ],
                "instruction": "Inspect raw frames and overlays for identity continuity and mask fit. Keep issues concise (one sentence; at most two per list). Retry only when justified. For spatial corrections, return retry_objects with corrected inclusive source-pixel boxes for ALL verified object IDs, preserving their roles, and retry_frame from an inspected source frame. Never invent or relabel objects. A target-only concept loses defender/ball roles, so prefer supported spatial correction for multi-object tracking. If correction cannot be supported, return empty retry_objects and refined_prompt. If no retry is needed, refined_prompt must be empty.",
            },
            Criticism,
            overlays,
        )
