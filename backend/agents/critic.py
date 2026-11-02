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
                "instruction": "Inspect raw frames and overlays for identity continuity and mask fit. Only recommend a retry when evidence justifies it. A refined concept must be a single concise noun phrase; spatial tokens are allowed only in the documented SAM grammar.",
            },
            Criticism,
            overlays,
        )
