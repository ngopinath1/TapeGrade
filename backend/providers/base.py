from typing import Protocol


class LeagueProvider(Protocol):
    def snapshot(self) -> dict: ...


class ScoringEngine:
    """Points scoring. A category implementation can share this interface later."""

    def score(self, stats: dict, weights: dict) -> float | None:
        if any(key not in stats or stats[key] is None for key in weights):
            return None
        return round(sum(stats[key] * weight for key, weight in weights.items()), 1)
