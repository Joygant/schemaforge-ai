import uuid
from datetime import datetime
from sqlalchemy import (
    String, Text, Integer, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def _new_uuid() -> str:
    return str(uuid.uuid4())


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    industry: Mapped[str] = mapped_column(String(100), default="Retail", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="discovery", nullable=False)
    # JSON blob storing extracted entities and business information
    business_context: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="session", cascade="all, delete-orphan"
    )
    xdm_outputs: Mapped[list["XDMOutput"]] = relationship(
        "XDMOutput", back_populates="session", cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="messages")


class XDMOutput(Base):
    __tablename__ = "xdm_outputs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    business_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    entity_model: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    xdm_design: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    json_export: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    architecture_diagram: Mapped[str | None] = mapped_column(Text, nullable=True)  # Mermaid markup
    quality_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quality_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    session: Mapped["Session"] = relationship("Session", back_populates="xdm_outputs")
