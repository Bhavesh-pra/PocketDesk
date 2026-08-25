"""
PDF processing orchestrator (PDFium / pypdfium2 variant).

Iterates through every page of a PDF, decides whether to use native text
extraction or OCR on a per-page basis, and assembles the final result
with full diagnostics.

This mirrors the Step 1 (PyMuPDF) orchestrator so the two implementations
can be directly compared.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import List

from config import MIN_NATIVE_TEXT_CHARS
from pdfium_extractor import extract_page_text, open_pdf
from pdfium_ocr import is_tesseract_available, ocr_page

logger = logging.getLogger(__name__)


@dataclass
class ProcessingResult:
    """Container for the complete processing outcome."""

    text: str = ""
    total_pages: int = 0
    ocr_page_numbers: List[int] = field(default_factory=list)
    native_text_page_count: int = 0
    pages_with_no_text: int = 0
    total_time: float = 0.0
    ocr_time: float = 0.0
    native_time: float = 0.0
    tesseract_available: bool = False


def process_pdf(file_path: str) -> ProcessingResult:
    """
    Process a PDF file end-to-end using pypdfium2 + Tesseract.

    For each page:
      1. Attempt native text extraction via PDFium.
      2. If the stripped text length is below ``MIN_NATIVE_TEXT_CHARS``,
         render the page via PDFium and run OCR (if Tesseract is available).
      3. Collect the text and record diagnostics.

    Returns a ``ProcessingResult`` with combined text and full metrics.
    """
    result = ProcessingResult()
    result.tesseract_available = is_tesseract_available()

    t_start = time.perf_counter()

    doc = open_pdf(file_path)
    try:
        result.total_pages = len(doc)
        page_texts: List[str] = []

        for page_index in range(len(doc)):
            page = doc[page_index]
            page_number = page_index + 1  # 1-based for API/diagnostics

            try:
                # ── Step 1: native extraction ──────────────────────────
                t_native = time.perf_counter()
                native_text = extract_page_text(page)
                result.native_time += time.perf_counter() - t_native

                if len(native_text.strip()) >= MIN_NATIVE_TEXT_CHARS:
                    # Usable native text
                    page_texts.append(native_text)
                    result.native_text_page_count += 1
                    continue

                # ── Step 2: OCR this page ──────────────────────────────
                if result.tesseract_available:
                    logger.info(
                        "Page %d: native text too short (%d chars), running OCR",
                        page_number,
                        len(native_text.strip()),
                    )
                    t_ocr = time.perf_counter()
                    ocr_text = ocr_page(page)
                    result.ocr_time += time.perf_counter() - t_ocr

                    if ocr_text.strip():
                        page_texts.append(ocr_text)
                        result.ocr_page_numbers.append(page_number)
                    else:
                        # OCR produced nothing — count as empty.
                        # Still keep whatever native text we got (could be a
                        # short heading, which is better than nothing).
                        page_texts.append(native_text)
                        if native_text.strip():
                            result.native_text_page_count += 1
                        else:
                            result.pages_with_no_text += 1
                else:
                    # Tesseract not available — use whatever native text exists
                    page_texts.append(native_text)
                    if native_text.strip():
                        result.native_text_page_count += 1
                    else:
                        result.pages_with_no_text += 1

            finally:
                # Close the page to release PDFium resources for this page
                try:
                    page.close()
                except Exception:
                    pass

    finally:
        doc.close()

    result.text = "\n".join(page_texts)
    result.total_time = time.perf_counter() - t_start
    return result
