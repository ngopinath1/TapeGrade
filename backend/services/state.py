from sqlalchemy import select

from backend.api.types import Guardrails
from backend.db.database import session_scope
from backend.db.schema import GuardrailSettings, League, Player, RosterSnapshot, User, Workspace
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
            s.flush()
        if s.get(Workspace, "local") is None:
            s.add(Workspace(user_id="local", active_league_id="demo-nba"))


def get_league(factory=None, league_id=None):
    with session_scope(factory) as s:
        workspace = s.get(Workspace, "local")
        return s.get(
            League, league_id or (workspace.active_league_id if workspace else "demo-nba")
        ).data


def get_guardrails(factory=None, league_id=None):
    league = get_league(factory, league_id)
    with session_scope(factory) as s:
        if not league.get("is_demo", True):
            return Guardrails.model_validate(
                league.get("guardrails") or Guardrails(protected_players=[]).model_dump()
            )
        return Guardrails.model_validate(s.get(GuardrailSettings, "local").data)


def save_league(snapshot, factory=None):
    """Persist an actual read-only provider snapshot and select its workspace."""
    with session_scope(factory) as s:
        row = s.get(League, snapshot["id"])
        data = dict(snapshot)
        if row and row.data.get("guardrails"):
            guards = dict(row.data["guardrails"])
            current = {p["id"] for p in snapshot["roster"]}
            guards["protected_players"] = [
                pid for pid in guards["protected_players"] if pid in current
            ]
            data["guardrails"] = guards
        if row:
            row.data = data
        else:
            row = League(
                id=data["id"], user_id="local", provider=data["provider"], is_demo=False, data=data
            )
            s.add(row)
            s.flush()
        for p in data["roster"] + data["available"]:
            existing = s.get(Player, p["id"])
            if existing:
                existing.data = p
            else:
                s.add(Player(id=p["id"], league_id=data["id"], is_demo=False, data=p))
        s.add(
            RosterSnapshot(
                league_id=data["id"],
                data={"roster": data["roster"], "period": data.get("period"), "source": "Sleeper"},
            )
        )
        s.get(Workspace, "local").active_league_id = data["id"]
    return data


def select_demo(factory=None):
    with session_scope(factory) as s:
        s.get(Workspace, "local").active_league_id = "demo-nba"
