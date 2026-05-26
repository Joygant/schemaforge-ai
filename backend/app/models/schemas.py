from pydantic import BaseModel
from typing import Any


# ── Session ────────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    industry: str = "Retail"


class SessionResponse(BaseModel):
    id: str
    status: str
    industry: str
    created_at: str
    business_context: dict | None = None


# ── Messages ───────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    session_id: str
    role: str
    content: str


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: str


# ── Chat ───────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    message: str
    session_status: str
    is_discovery_complete: bool = False
    business_context: dict | None = None


# ── XDM Generation ─────────────────────────────────────────────────────────────

class XDMGenerateRequest(BaseModel):
    session_id: str


class XDMOutputResponse(BaseModel):
    session_id: str
    business_summary: dict[str, Any]
    entity_model: dict[str, Any]
    xdm_design: dict[str, Any]
    json_export: dict[str, Any]
    architecture_diagram: str
    quality_score: dict[str, Any]
    generated_at: str


# ── Quality Score ──────────────────────────────────────────────────────────────

class QualityScoreResponse(BaseModel):
    overall: int
    breakdown: dict[str, int]  # each key 0-100
    recommendations: list[str]


# ── AI Co-pilot ────────────────────────────────────────────────────────────────

class CopilotRequest(BaseModel):
    session_id: str
    question: str


class CopilotResponse(BaseModel):
    question: str
    answer: str
