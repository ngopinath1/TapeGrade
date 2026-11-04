from backend.api.types import Criticism


class PerceptionCritic:
    def __init__(self, spark):
        self.spark = spark

    def inspect(
        self, player_id, attempt, tracking, overlays, seed_objects=None, identity_context=None
    ):
        return self.spark.reason(
            "critic",
            {
                "player_id": player_id,
                "attempt": attempt,
                "prompt": tracking.prompt,
                "width": tracking.width,
                "height": tracking.height,
                "verified_seed_objects": seed_objects or [],
                "identity_context": identity_context,
                "frames": [
                    f.model_dump() for f in tracking.frames[:: max(1, len(tracking.frames) // 5)]
                ],
                "instruction": "Inspect raw frames and overlays for identity continuity and mask fit. When identity_context is supplied, confirm that ID 1 remains the identified target jersey/team and that every defender is on the opposing team: a teammate must never count as a defender. Return target_identity_preserved and team_roles_preserved explicitly, and list any role_conflicts. Also return player_identity_checks for EACH named seed player: object_id, identity_preserved, reason. Check that each ID stays on its original jersey/team, including swaps between teammates; mark false for drift, uncertainty or an unverified identity. Do not copy the target's check to other IDs. A correct out-of-view exit is not an identity swap. Keep issues concise (one sentence; at most two per list). Retry only when justified. For spatial corrections, return retry_objects with corrected inclusive source-pixel boxes for ALL verified object IDs, preserving their roles, and retry_frame from an inspected source frame. Never invent or relabel objects. A target-only concept loses defender/ball roles, so prefer supported spatial correction for multi-object tracking. If correction cannot be supported, return empty retry_objects and refined_prompt. If no retry is needed, refined_prompt must be empty.",
            },
            Criticism,
            overlays,
        )
