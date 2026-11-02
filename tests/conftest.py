"""All tests are offline. Override process env before importing application config."""

import os

os.environ["MOCK_MODELS"] = "1"
os.environ["DEMO_MODE"] = "1"
os.environ["MODEL_API_KEY"] = ""
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SCHEDULER_ENABLED"] = "0"

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from backend.config import Settings, settings
from backend.db import database
from backend.services.state import seed_demo


@pytest.fixture(autouse=True)
def offline(monkeypatch):
    def denied(*args, **kwargs):
        raise AssertionError("Tests must not make external network requests")

    monkeypatch.setattr(httpx.HTTPTransport, "handle_request", denied)


@pytest.fixture
def store(tmp_path, monkeypatch):
    data = tmp_path / "data"
    data.mkdir()
    monkeypatch.setattr(Settings, "data_dir", property(lambda self: data))
    engine = database.make_engine("sqlite:///" + str(tmp_path / "test.db"))
    factory = sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(database, "engine", engine)
    monkeypatch.setattr(database, "Session", factory)
    database.initialize(engine)
    seed_demo(factory)
    yield factory
    engine.dispose()


@pytest.fixture
def client(store):
    from backend.main import app

    # StaticFiles captures paths at application creation; reset per isolated test.
    from fastapi.staticfiles import StaticFiles

    app.router.routes[:] = [
        r for r in app.router.routes if not getattr(r, "path", "").startswith("/media/")
    ]
    for folder in ("cache", "uploads", "samples"):
        path = settings.data_dir / folder
        path.mkdir(exist_ok=True)
        app.mount("/media/" + folder, StaticFiles(directory=path), name=folder)
    with TestClient(app) as client:
        yield client
