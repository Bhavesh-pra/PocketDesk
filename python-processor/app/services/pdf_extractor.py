"""
Native PDF text extraction using pypdfium2 / PDFium.

Handles opening PDFs, validating them, and extracting embedded text on a
per-page basis. All PDFium resources are closed explicitly to avoid leaks.
"""

from __future__ import annotations

import logging

import pypdfium2 as pdfium

logger = logging.getLogger(__name__)


def open_pdf(path: str) -> pdfium.PdfDocument:
    """
    Open a PDF file and return the pypdfium2 PdfDocument handle.

    Raises ``ValueError`` if the file cannot be opened, is not a valid PDF,
    or is encrypted / password-protected.
    """
    try:
        doc = pdfium.PdfDocument(path)
    except pdfium.PdfiumError as exc:
        raise ValueError(f"Cannot open PDF: {exc}") from exc
    except Exception as exc:
        raise ValueError(f"Cannot open PDF: {exc}") from exc

    return doc


def extract_page_text(page: pdfium.PdfPage) -> str:
    """
    Extract native (embedded) text from a single PDF page.

    Uses ``PdfTextPage.get_text_bounded()`` which extracts all text on the
    page within the full page bounds. The PdfTextPage helper is closed
    immediately after extraction.
    """
    textpage = None
    try:
        textpage = page.get_textpage()
        text = textpage.get_text_bounded()
        return text if text else ""
    except Exception:
        logger.exception("Native text extraction failed for page (pypdfium2)")
        return ""
    finally:
        if textpage is not None:
            try:
                textpage.close()
            except Exception:
                pass

