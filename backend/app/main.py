from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.routes import health, reviews, settings as settings_routes, webhooks


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    log = get_logger(__name__)
    s = get_settings()
    log.info(
        "codexa-ai_startup",
        env=s.environment,
        gemini=bool(s.gemini_api_key),
        groq=bool(s.groq_api_key),
    )
    yield
    log.info("codexa-ai_shutdown")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Codexa AI",
        description="AI Code Review Bot — backend",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url, "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-GitHub-Event", "X-Hub-Signature-256"],
        expose_headers=["WWW-Authenticate"],
    )

    app.include_router(health.router)
    app.include_router(webhooks.router)
    app.include_router(reviews.router)
    app.include_router(settings_routes.router)
    return app


app = create_app()
