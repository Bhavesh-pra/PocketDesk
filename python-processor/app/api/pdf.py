"""
API route for PDF processing.

POST /process/pdf — accepts a multipart/form-data upload, processes the
PDF, and returns structured JSON with extracted text and diagnostics.
"""

from __future__ import annotations

import logging
import os
import tempfile
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import MAX_UPLOAD_BYTES
from app.schemas.pdf import PDFErrorResponse, PDFSuccessResponse, ProcessingDiagnostics
from app.services.ocr_service import is_tesseract_available
from app.services.pdf_processor import process_pdf

logger = logging.getLogger(__name__)

router = APIRouter()

# Allowed MIME types (same set as the Node backend)
_ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
}


def _validate_upload(file: UploadFile) -> None:
    """
    Validate the uploaded file before processing.

    Raises ``HTTPException`` on validation failure.
    """
    if file is None or file.filename is None:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Extension check
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Only .pdf files are accepted.",
        )

    # MIME type check (some clients send generic types; be lenient on
    # octet-stream but strict on anything else)
    ct = (file.content_type or "").lower()
    if ct and ct != "application/octet-stream" and ct not in _ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type '{ct}'. Only PDF files are accepted.",
        )


@router.post(
    "/process/pdf",
    response_model=PDFSuccessResponse,
    responses={400: {"model": PDFErrorResponse}, 500: {"model": PDFErrorResponse}},
    summary="Process a PDF and extract text",
)
async def process_pdf_endpoint(file: UploadFile = File(...)):
    """
    Accept a PDF via multipart upload, extract text (with page-level OCR
    as needed), and return the result as JSON.
    """
    _validate_upload(file)

    # Read the entire upload into memory first so we can check size
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File too large ({len(contents)} bytes). "
                f"Maximum allowed is {MAX_UPLOAD_BYTES} bytes "
                f"({MAX_UPLOAD_BYTES // (1024 * 1024)} MB)."
            ),
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Write to a secure temp file — UUID name prevents any path-traversal
    tmp_fd = None
    tmp_path = None
    try:
        tmp_fd, tmp_path = tempfile.mkstemp(
            suffix=".pdf", prefix=f"pocketdesk-{uuid.uuid4().hex[:8]}-"
        )
        os.write(tmp_fd, contents)
        os.close(tmp_fd)
        tmp_fd = None  # Mark as closed

        # Free the in-memory copy
        del contents

        result = process_pdf(tmp_path)

        return PDFSuccessResponse(
            success=True,
            text=result.text,
            pages=result.total_pages,
            ocr_pages=result.ocr_page_numbers,
            native_text_pages=result.native_text_page_count,
            processing_time_seconds=round(result.total_time, 3),
            diagnostics=ProcessingDiagnostics(
                ocr_time_seconds=round(result.ocr_time, 3),
                native_extraction_time_seconds=round(result.native_time, 3),
                pages_with_no_text=result.pages_with_no_text,
                tesseract_available=result.tesseract_available,
            ),
        )

    except ValueError as exc:
        # Raised by pdf_extractor for malformed / encrypted PDFs
        logger.warning("PDF validation error: %s", exc)
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Unable to process PDF",
                "details": str(exc),
            },
        )

    except HTTPException:
        raise  # Re-raise FastAPI HTTP exceptions as-is

    except Exception:
        logger.exception("Unexpected error processing PDF")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Unable to process PDF",
                "details": "An internal error occurred. Check server logs for details.",
            },
        )

    finally:
        # Ensure the temp file is always cleaned up
        if tmp_fd is not None:
            try:
                os.close(tmp_fd)
            except OSError:
                pass
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                logger.warning("Failed to clean up temp file: %s", tmp_path)
