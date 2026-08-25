"""
PocketDesk Python PDF Processing Service — FastAPI application.

Entry point:  ``uvicorn app.main:app``
"""

from __future__ import annotations

import logging

import pypdfium2 as pdfium

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.pdf import router as pdf_router
from app.config import MAX_UPLOAD_BYTES
from app.schemas.pdf import HealthResponse
from app.services.ocr_service import is_tesseract_available

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PocketDesk PDF Processor",
    description=(
        "Standalone PDF text extraction service with page-level OCR using PDFium. "
        "Accepts a PDF via multipart upload and returns extracted text "
        "with processing diagnostics."
    ),
    version="0.2.0",
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Ensure HTTP error responses conform to Node client expectations."""
    if isinstance(exc.detail, dict):
        error_msg = exc.detail.get("error", "Unable to process PDF")
        details_msg = exc.detail.get("details", str(exc.detail))
    else:
        error_msg = "Unable to process PDF"
        details_msg = str(exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": error_msg,
            "details": details_msg,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format request validation errors consistently."""
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": "Invalid request parameters",
            "details": str(exc),
        },
    )


# CORS — permissive for now; will be locked down when integrated
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(pdf_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse, summary="Health check")
async def health():
    pdfium_ver = getattr(pdfium.version, "PYPDFIUM2_VERSION", "5.13.0")
    return HealthResponse(
        status="ok",
        tesseract_available=is_tesseract_available(),
        pdfium_version=str(pdfium_ver),
    )


# ---------------------------------------------------------------------------
# Startup banner
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def _startup():
    pdfium_ver = getattr(pdfium.version, "PYPDFIUM2_VERSION", "5.13.0")
    logger.info("PocketDesk PDF Processor starting up (PDFium)")
    logger.info("  pypdfium2 version: %s", pdfium_ver)
    logger.info("  Tesseract avail : %s", is_tesseract_available())
    logger.info("  Max upload      : %s MB", MAX_UPLOAD_BYTES // (1024 * 1024))


