from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT / ".env", extra="ignore")
    model_api_key: SecretStr = SecretStr("")
    mock_models: bool = True
    demo_mode: bool = True
    database_url: str = "sqlite:///./data/tapegrade.db"
    max_candidates: int = Field(3, ge=1, le=6)
    max_clips_per_candidate: int = Field(1, ge=1, le=1)
    max_sam_retries: int = Field(2, ge=0, le=2)
    max_live_model_calls_per_scan: int = Field(15, ge=1, le=50)
    max_clip_seconds: int = Field(30, ge=1, le=30)
    max_upload_mb: int = Field(100, ge=1, le=200)
    meta_base_url: str = "https://api.meta.ai"
    spark_model: str = "muse-spark-1.3"
    sam_model: str = "sam-3.1"
    image_model: str = "muse-image-1.0"
    model_timeout_seconds: int = 120
    perception_quality_threshold: float = Field(0.75, ge=0, le=1)
    scheduler_enabled: bool = False
    worker_poll_seconds: float = 1
    # Heartbeats/leases are refreshed by the worker around each expensive operation.
    job_lease_seconds: int = 600

    @property
    def data_dir(self) -> Path:
        return ROOT / "data"


settings = Settings()
