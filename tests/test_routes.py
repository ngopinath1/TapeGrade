from backend.config import settings
from backend.db.database import session_scope
from backend.db.schema import ScanRun
from backend.worker.scan import run_once


def test_routes_persistence_and_download(client, store):
    assert client.get("/api/health").json()["status"] == "ok"
    bootstrap = client.get("/api/bootstrap").json()
    assert len(bootstrap["league"]["roster"]) == 6 and bootstrap["models_mode"] == "mock"
    assert "model_api_key" not in str(bootstrap).lower()
    response = client.post(
        "/api/scans",
        json={"instruction": "Find me an undervalued guard."},
        headers={"Idempotency-Key": "test-1"},
    )
    assert response.status_code == 202
    sid = response.json()["id"]
    assert client.get("/api/scans/" + sid).json()["stage"] == "QUEUED"
    assert run_once(store)
    run = client.get("/api/scans/" + sid).json()
    assert run["stage"] == "COMPLETED", run["error"]
    assert any("Retrying tracking" in e["message"] for e in run["events"])
    card = client.get(f"/api/scans/{sid}/card")
    assert card.status_code == 200 and card.content.startswith(b"\x89PNG")
    assert "attachment" in card.headers["content-disposition"]
    assert client.get("/api/scans").json()[0]["id"] == sid
    # Idempotency survives completion and process-local state changes.
    assert (
        client.post(
            "/api/scans",
            json={"instruction": "Find me an undervalued guard."},
            headers={"Idempotency-Key": "test-1"},
        ).json()["id"]
        == sid
    )
    assert client.post("/api/watchlist/c1").json() == {"watching": True}
    assert client.get("/api/bootstrap").json()["watchlist"] == ["c1"]
    assert client.post("/api/watchlist/c1").json() == {"watching": False}
    # Tightened settings withdraw existing moves, even with an old scan open.
    saved = bootstrap["settings"]
    saved["protected_players"].append("r5")
    assert client.put("/api/settings", json=saved).status_code == 200
    assert client.get("/api/scans/" + sid).json()["result"]["staged_move"] is None
    assert client.get("/api/settings").json()["protected_players"] == saved["protected_players"]


def test_validation_and_failed_retry(client, store):
    assert client.get("/api/scans/missing").status_code == 404
    assert client.post("/api/scans", json={"instruction": "x"}).status_code == 422
    invalid = client.get("/api/settings").json()
    invalid["protected_players"] = ["unknown"]
    assert client.put("/api/settings", json=invalid).status_code == 422
    sid = client.post("/api/scans", json={"instruction": "Find guard"}).json()["id"]
    assert client.post(f"/api/scans/{sid}/retry").status_code == 409
    with session_scope(store) as s:
        row = s.get(ScanRun, sid)
        row.stage = "FAILED"
        row.error = "interrupted"
    assert client.post(f"/api/scans/{sid}/retry").status_code == 202
    assert run_once(store)
    assert client.get("/api/scans/" + sid).json()["stage"] == "COMPLETED"


def test_live_missing_credentials_has_no_simulated_fallback(client, monkeypatch):
    monkeypatch.setattr(settings, "mock_models", False)
    response = client.post("/api/scans", json={"instruction": "Find a guard"})
    assert response.status_code == 409 and "MODEL_API_KEY" in response.json()["detail"]
    assert client.get("/api/scans").json() == []


def test_upload_validation(client):
    assert (
        client.post(
            "/api/clips",
            data={"player_id": "c1", "rights_confirmed": "false"},
            files={"file": ("a.mp4", b"video")},
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/clips",
            data={"player_id": "c1", "rights_confirmed": "true"},
            files={"file": ("a.exe", b"bad")},
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/clips",
            data={"player_id": "c1", "rights_confirmed": "true"},
            files={"file": ("a.mp4", b"bad")},
        ).status_code
        == 422
    )


def test_media_mount_does_not_expose_database_or_env(client):
    assert client.get("/media/tapegrade.db").status_code == 404
    assert client.get("/media/.env").status_code == 404
