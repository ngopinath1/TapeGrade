from datetime import datetime
import re
import time
from zoneinfo import ZoneInfo

import httpx


class ProviderError(ValueError):
    pass


class SleeperLeagueProvider:
    BASE = "https://api.sleeper.app/v1"

    def __init__(self, client=None):
        self.client = client or httpx.Client(timeout=15)
        self.cache = {}

    def get(self, path):
        cached = self.cache.get(path)
        if cached and time.monotonic() - cached[0] < 300:
            return cached[1]
        try:
            response = self.client.get(self.BASE + path)
            if response.status_code == 429:
                raise ProviderError(
                    "Sleeper rate limit reached. Please try again in a few minutes."
                )
            if response.status_code == 404:
                raise ProviderError("Sleeper account or league not found.")
            response.raise_for_status()
            data = response.json()
        except (httpx.HTTPError, ValueError) as e:
            if isinstance(e, ProviderError):
                raise
            raise ProviderError(
                "Sleeper is unavailable or returned invalid data. The sample NBA league is still available."
            ) from None
        if data is None:
            raise ProviderError("Sleeper account not found. Check the username.")
        self.cache[path] = (time.monotonic(), data)
        return data

    def connect(self, username, season=None):
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", username):
            raise ProviderError("Enter a valid Sleeper username.")
        user = self.get("/user/" + username)
        year = season or datetime.now(ZoneInfo("America/New_York")).year
        leagues = self.get(f'/user/{user["user_id"]}/leagues/nfl/{year}')
        return {
            "user": user,
            "leagues": leagues,
            "season": year,
            "basketball_supported": False,
            "notice": "Sleeper publicly documents NFL-only league discovery. These are actual NFL league records, not basketball data. Use the fictional NBA sample for scouting.",
        }

    def league(self, league_id):
        if not re.fullmatch(r"\d{1,30}", league_id):
            raise ProviderError("Invalid Sleeper league ID.")
        league = self.get("/league/" + league_id)
        if league.get("sport") != "nfl":
            raise ProviderError(
                "This sport is not supported by the documented public API integration."
            )
        return {
            "league": league,
            "rosters": self.get(f"/league/{league_id}/rosters"),
            "users": self.get(f"/league/{league_id}/users"),
            "source": "Sleeper public API · actual NFL data",
        }

    def snapshot(self):
        raise ProviderError(
            "Sleeper basketball scouting is unavailable. Select the sample NBA league."
        )
