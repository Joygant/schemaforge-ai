from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, sessions, xdm
from app.core.config import settings
from app.core.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup; nothing special on shutdown."""
    await create_tables()
    yield


app = FastAPI(
    title="Conversational XDM Designer API",
    description=(
        "AI-powered Adobe XDM schema designer for non-technical marketers. "
        "Conduct a plain-English business interview and receive complete "
        "Adobe Experience Platform schema designs, JSON exports, and quality scores."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(xdm.router, prefix="/api")


@app.get("/health", tags=["health"])
async def health():
    """Health-check endpoint."""
    return {"status": "healthy", "service": "XDM Designer API"}
