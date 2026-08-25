"""
OCR service — renders a PDF page to an image via PDFium and runs Tesseract.

Uses pypdfium2 for rendering and pytesseract for OCR. Images are kept
entirely in memory (PIL Image); no temporary image files are written.
Only one page is rendered at a time to keep memory usage bounded.
"""

from __future__ import annotations

import logging
import shutil

import pypdfium2 as pdfium

from app.config import OCR_DPI

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tesseract availability detection (checked once at import time)
# ---------------------------------------------------------------------------
_tesseract_available: bool = False
_pytesseract = None

try:
    import pytesseract as _pt

    # Verify the binary is actually reachable
    if shutil.which("tesseract") or shutil.which("tesseract.exe"):
        _pytesseract = _pt
        _tesseract_available = True
        logger.info("Tesseract OCR binary detected.")
    else:
        # pytesseract installed but binary missing
        logger.warning(
            "pytesseract package found but 'tesseract' binary is not on PATH. "
            "OCR will be unavailable."
        )
except ImportError:
    logger.warning("pytesseract package not installed. OCR will be unavailable.")


def is_tesseract_available() -> bool:
    """Return whether Tesseract OCR can be used."""
    return _tesseract_available


def ocr_page(page: pdfium.PdfPage) -> str:
    """
    Render a single PDF page to a bitmap via PDFium and run Tesseract OCR.

    The bitmap and PIL image are created in memory and discarded
    immediately after OCR. Only one page image exists at a time.

    Args:
        page: An open pypdfium2 PdfPage object.

    Returns:
        The recognised text, or an empty string on failure.

    Raises:
        RuntimeError: If Tesseract is not available.
    """
    if not _tesseract_available or _pytesseract is None:
        raise RuntimeError(
            "Tesseract is not available. Install 'tesseract-ocr' OS package "
            "and ensure it is on PATH."
        )

    bitmap = None
    img = None
    try:
        # Render at configured DPI.
        # PDFium scale factor: scale = target_dpi / 72
        scale = OCR_DPI / 72.0
        bitmap = page.render(scale=scale, rotation=0)

        # Convert PDFium bitmap → PIL Image (in-memory, no disk I/O)
        img = bitmap.to_pil()

        # Free the PDFium bitmap immediately — we only need the PIL Image now
        bitmap.close()
        bitmap = None

        text: str = _pytesseract.image_to_string(img, lang="eng")

        # Free the PIL Image
        img.close()
        img = None

        return text or ""

    except Exception:
        logger.exception("OCR failed for page (pypdfium2 + Tesseract)")
        return ""
    finally:
        # Defensive cleanup in case of early exit
        if bitmap is not None:
            try:
                bitmap.close()
            except Exception:
                pass
        if img is not None:
            try:
                img.close()
            except Exception:
                pass

