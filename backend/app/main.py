import contextlib
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import logger
from app.db.session import engine, Base
import app.models  # ensure all models are registered
import app.tools  # ensure all tools are registered

from app.api.routes import (
    health,
    dashboard,
    agent,
    orders,
    cases,
    follow_ups,
)


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables are created
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("ResolveLoop AI application startup complete.")
    yield
    logger.info("ResolveLoop AI application shutdown.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered ecommerce customer-support resolution assistant for the "
        "Amazon Developer Hackathon 2026 Alexa+ track. Investigates orders, "
        "evaluates store policies, orchestrates tool calls, drafts responses, "
        "enforces merchant approvals, and schedules follow-up tasks."
    ),
    lifespan=lifespan,
)

# CORS middleware
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized error handling
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": 422,
            "message": "Request validation error",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "message": "An unexpected internal server error occurred.",
        },
    )


# Register API Routes
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(agent.router)
app.include_router(orders.router)
app.include_router(cases.router)
app.include_router(follow_ups.router)
