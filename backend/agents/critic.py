from backend.api.types import Criticism


class PerceptionCritic:
    def __init__(self, spark):
        self.spark = spark

    def inspect(self, player_id, attempt, tracking, overlays):
        return self.spark.reason(
            "critic",
            {
                "player_id": player_id,
                "attempt": attempt,
                "prompt": tracking.prompt,
                "width": tracking.width,
                "height": tracking.height,
                "frames": [
                    f.model_dump() for f in tracking.frames[:: max(1, len(tracking.frames) // 5)]
                ],
                "instruction": "Inspect raw frames and overlays for identity continuity and mask fit. Keep every issue and the explanation concise (one short sentence each; at most two issues per list). Only recommend a retry when evidence justifies it. If no retry is needed, refined_prompt must be empty. Otherwise prefer a single concise noun phrase for the target; spatial tokens are allowed only in the documented SAM grammar.",
            },
            Criticism,
            overlays,
        )
