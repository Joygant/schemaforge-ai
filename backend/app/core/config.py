from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./xdm_designer.db"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    MODEL_ID: str = "claude-sonnet-4-6"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
