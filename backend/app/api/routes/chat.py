import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.database_models import Message as MessageModel
from app.models.database_models import Session as SessionModel
from app.models.schemas import ChatRequest, ChatResponse
from app.services.claude_service import chat_with_claude, extract_business_context

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send a user message and receive an AI response."""
    # Fetch session
    result = await db.execute(
        select(SessionModel).where(SessionModel.id == request.session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Load existing message history ordered chronologically
    msg_result = await db.execute(
        select(MessageModel)
        .where(MessageModel.session_id == request.session_id)
        .order_by(MessageModel.created_at)
    )
    messages = msg_result.scalars().all()

    # Build history list for Claude (include new user message at the end)
    history = [{"role": m.role, "content": m.content} for m in messages]
    history.append({"role": "user", "content": request.message})

    # Persist the user message
    user_msg = MessageModel(
        id=str(uuid.uuid4()),
        session_id=request.session_id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)

    # Call Claude
    response_text, is_complete = await chat_with_claude(
        history, session.business_context or {}
    )

    # Persist the assistant message
    assistant_msg = MessageModel(
        id=str(uuid.uuid4()),
        session_id=request.session_id,
        role="assistant",
        content=response_text,
    )
    db.add(assistant_msg)

    # If discovery is now complete, extract and store business context
    if is_complete and session.status == "discovery":
        session.status = "extracting"
        all_messages = history + [{"role": "assistant", "content": response_text}]
        business_context = await extract_business_context(all_messages)
        session.business_context = business_context
        session.status = "ready"

    await db.commit()

    return ChatResponse(
        session_id=request.session_id,
        message=response_text,
        session_status=session.status,
        is_discovery_complete=is_complete,
        business_context=session.business_context,
    )


@router.get("/{session_id}/history")
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Return the full message history for a session."""
    msg_result = await db.execute(
        select(MessageModel)
        .where(MessageModel.session_id == session_id)
        .order_by(MessageModel.created_at)
    )
    messages = msg_result.scalars().all()
    return {
        "messages": [
            {"id": m.id, "role": m.role, "content": m.content}
            for m in messages
        ]
    }
