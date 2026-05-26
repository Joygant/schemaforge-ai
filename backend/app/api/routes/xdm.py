import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.database_models import Session as SessionModel
from app.models.database_models import XDMOutput as XDMOutputModel
from app.models.schemas import (
    CopilotRequest,
    CopilotResponse,
    XDMGenerateRequest,
    XDMOutputResponse,
)
from app.services.claude_service import answer_copilot_question
from app.services.output_generator import (
    generate_business_summary,
    generate_entity_model,
    generate_json_export,
    generate_mermaid_diagram,
)
from app.services.xdm_engine import generate_quality_score, generate_xdm_schemas

router = APIRouter(prefix="/xdm", tags=["xdm"])


@router.post("/generate", response_model=XDMOutputResponse)
async def generate_xdm(
    request: XDMGenerateRequest, db: AsyncSession = Depends(get_db)
):
    """Generate complete XDM schema design for a session."""
    # Fetch session
    result = await db.execute(
        select(SessionModel).where(SessionModel.id == request.session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.business_context:
        raise HTTPException(
            status_code=400,
            detail="Discovery not complete yet. Finish the interview first.",
        )

    business_context = session.business_context

    # Generate all output sections
    xdm_design = generate_xdm_schemas(business_context)
    business_summary = generate_business_summary(business_context, xdm_design)
    entity_model = generate_entity_model(business_context, xdm_design)
    mermaid_diagram = generate_mermaid_diagram(xdm_design, business_context)
    json_export = generate_json_export(xdm_design, business_context)
    quality = generate_quality_score(xdm_design, business_context)

    # Persist the output
    now = datetime.utcnow()
    output = XDMOutputModel(
        id=str(uuid.uuid4()),
        session_id=request.session_id,
        generated_at=now,
        business_summary=business_summary,
        entity_model=entity_model,
        xdm_design=xdm_design,
        json_export=json_export,
        architecture_diagram=mermaid_diagram,
        quality_score=quality["overall"],
        quality_details=quality,
    )
    db.add(output)
    session.status = "complete"
    await db.commit()

    return XDMOutputResponse(
        session_id=request.session_id,
        business_summary=business_summary,
        entity_model=entity_model,
        xdm_design=xdm_design,
        json_export=json_export,
        architecture_diagram=mermaid_diagram,
        quality_score=quality,
        generated_at=str(now),
    )


@router.get("/{session_id}", response_model=XDMOutputResponse)
async def get_xdm_output(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve the most recent XDM output for a session."""
    result = await db.execute(
        select(XDMOutputModel)
        .where(XDMOutputModel.session_id == session_id)
        .order_by(XDMOutputModel.generated_at.desc())
    )
    output = result.scalar_one_or_none()
    if not output:
        raise HTTPException(
            status_code=404,
            detail="XDM output not found. Call /api/xdm/generate first.",
        )

    return XDMOutputResponse(
        session_id=session_id,
        business_summary=output.business_summary,
        entity_model=output.entity_model,
        xdm_design=output.xdm_design,
        json_export=output.json_export,
        architecture_diagram=output.architecture_diagram,
        quality_score=output.quality_details,
        generated_at=str(output.generated_at),
    )


@router.post("/copilot", response_model=CopilotResponse)
async def ask_copilot(
    request: CopilotRequest, db: AsyncSession = Depends(get_db)
):
    """Ask the AI co-pilot a question about the generated XDM design."""
    result = await db.execute(
        select(SessionModel).where(SessionModel.id == request.session_id)
    )
    session = result.scalar_one_or_none()
    if not session or not session.business_context:
        raise HTTPException(
            status_code=404,
            detail="Session not found or discovery not complete.",
        )

    xdm_result = await db.execute(
        select(XDMOutputModel)
        .where(XDMOutputModel.session_id == request.session_id)
        .order_by(XDMOutputModel.generated_at.desc())
    )
    xdm_output = xdm_result.scalar_one_or_none()

    answer = await answer_copilot_question(
        question=request.question,
        business_context=session.business_context,
        xdm_design=xdm_output.xdm_design if xdm_output else {},
    )

    return CopilotResponse(question=request.question, answer=answer)
