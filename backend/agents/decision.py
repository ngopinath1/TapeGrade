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
                "rules": "Ground each verdict in supplied measured metric_refs. No ADD without verified reliable film; acknowledge sample size and proxies. Return no move when evidence is insufficient. Never drop protected players.",
            },
            Decision,
        )
        return validate_decision(
            decision, candidates, league["roster"], guardrails, league["faab_remaining"]
        )
