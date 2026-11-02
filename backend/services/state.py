from sqlalchemy import select

from backend.api.types import Guardrails
from backend.db.database import session_scope
from backend.db.schema import GuardrailSettings, League, Player, RosterSnapshot, User
from backend.providers.demo import DemoLeagueProvider


def seed_demo(factory=None):
    with session_scope(factory) as s:
        if s.get(User, "local") is None:
            s.add(User(id="local"))
            s.flush()
        if s.get(GuardrailSettings, "local") is None:
            s.add(GuardrailSettings(user_id="local", data=Guardrails().model_dump()))
        if s.get(League, "demo-nba") is None:
            data = DemoLeagueProvider().snapshot()
            s.add(League(id="demo-nba", user_id="local", provider="demo", is_demo=True, data=data))
            s.flush()
            for p in data["roster"] + data["available"]:
                s.add(Player(id=p["id"], league_id="demo-nba", is_demo=True, data=p))
            s.add(RosterSnapshot(league_id="demo-nba", data={"roster": data["roster"]}))


def get_league(factory=None):
    with session_scope(factory) as s:
        return s.get(League, "demo-nba").data


def get_guardrails(factory=None):
    with session_scope(factory) as s:
        return Guardrails.model_validate(s.get(GuardrailSettings, "local").data)
