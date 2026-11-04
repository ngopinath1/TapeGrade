from backend.api.types import Shortlist


class ScoutAgent:
    def __init__(self, spark):
        self.spark = spark

    def shortlist(self, instruction: str, league: dict, limit: int) -> Shortlist:
        result = self.spark.reason(
            "scout",
            {
                "instruction": instruction,
                "available": league["available"],
                "roster": league["roster"],
                "scoring": league["scoring"],
                "game_mode": league.get("rules", {}).get("game_mode", "sample"),
                "valuation": "Compare exact recent per-game averages with sample sizes. Lock-In and Game Pick count one game per player per week; never multiply a mean by games scheduled. Unrostered does not establish eligibility.",
                "limit": limit,
            },
            Shortlist,
        )
        available = {p["id"] for p in league["available"]}
        if (
            len(result.player_ids) > limit
            or len(set(result.player_ids)) != len(result.player_ids)
            or not set(result.player_ids) <= available
        ):
            raise ValueError("Scout returned an invalid shortlist.")
        return result
