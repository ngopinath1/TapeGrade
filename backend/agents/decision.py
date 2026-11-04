from backend.api.types import Decision
from backend.services.staging import validate_decision


class DecisionAgent:
    def __init__(self, spark):
        self.spark = spark

    def decide(self, instruction, league, candidates, guardrails):
        decision = self.spark.reason(
            "decide",
            {
                "instruction": instruction,
                "roster": league["roster"],
                "scoring": league["scoring"],
                "candidates": candidates,
                "guardrails": guardrails.model_dump(),
                "faab_remaining": league["faab_remaining"],
                "game_mode": league.get("rules", {}).get("game_mode", "sample"),
                "waiver_mode": league.get("rules", {}).get("waiver_mode", "sample"),
                "statistics_source": league.get("stats_summary"),
                "eligibility": league.get("scan_readiness"),
                "valuation": "Use recent_fantasy_average and recent source rows for comparisons. fantasy_points is a reported period total in a real Sleeper league. No games-per-week multiplication in Lock-In/Game Pick. Return null faab_bid for non-FAAB moves. Eligibility and lock evidence may be unknown; never guarantee a legal transaction.",
                "rules": "Ground each verdict in supplied measured metric_refs. No ADD without verified reliable film; acknowledge sample size and proxies. For real athletes, no ADD or move unless the candidate has eligible_drop_ids; choose a drop only from that list. Otherwise return MONITOR or PASS with no move and explain the missing eligibility evidence. Never drop protected players.",
            },
            Decision,
        )
        return validate_decision(
            decision,
            candidates,
            league["roster"],
            guardrails,
            league["faab_remaining"],
            league=league,
        )
