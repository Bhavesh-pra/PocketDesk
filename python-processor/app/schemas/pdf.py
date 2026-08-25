"""
Pydantic response schemas for the PDF processing API.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ProcessingDiagnostics(BaseModel):
    """Detailed timing and capability diagnostics."""

    ocr_time_seconds: float = Field(
        ..., description="Total wall-clock time spent on OCR (rendering + recognition)."
    )
    native_extraction_time_seconds: float = Field(
        ..., description="Total wall-clock time spent on native text extraction."
    )
    pages_with_no_text: int = Field(
        ..., description="Pages that produced no usable text from either method."
    )
    tesseract_available: bool = Field(
        ..., description="Whether the Tesseract binary was detected at startup."
    )


class PDFSuccessResponse(BaseModel):
    """Returned on successful PDF processing."""

    success: bool = True
    text: str = Field(..., description="Combined extracted text from all pages.")
    pages: int = Field(..., description="Total number of pages in the PDF.")
    ocr_pages: List[int] = Field(
        ..., description="1-based page numbers that required OCR."
    )
    native_text_pages: int = Field(
        ..., description="Count of pages handled by native text extraction."
    )
    processing_time_seconds: float = Field(
        ..., description="Total wall-clock time for the entire processing pipeline."
    )
    diagnostics: ProcessingDiagnostics


class PDFErrorResponse(BaseModel):
    """Returned when processing fails."""

    success: bool = False
    error: str = Field(..., description="Human-readable error summary.")
    details: Optional[str] = Field(
        None, description="Additional technical detail (safe for API consumers)."
    )


class HealthResponse(BaseModel):
    """Returned by GET /health."""

    status: str = "ok"
    tesseract_available: bool = Field(
        ..., description="Whether Tesseract OCR is available."
    )
    pdfium_version: Optional[str] = Field(
        None, description="Installed pypdfium2 version."
    )
    pymupdf_version: Optional[str] = Field(
        None, description="Legacy PyMuPDF version (if present)."
    )

