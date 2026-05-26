import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.database_models import Session as SessionModel
from app.models.schemas import SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session(db: AsyncSession = Depends(get_db)):
    """Create a new discovery session."""
    session = SessionModel(id=str(uuid.uuid4()))
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return SessionResponse(
        id=session.id,
        status=session.status,
        industry=session.industry,
        created_at=str(session.created_at),
        business_context=session.business_context,
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve an existing session by ID."""
    result = await db.execute(
        select(SessionModel).where(SessionModel.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(
        id=session.id,
        status=session.status,
        industry=session.industry,
        created_at=str(session.created_at),
        business_context=session.business_context,
    )
