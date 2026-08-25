"""
Configuration for the PDFium benchmark PDF processor.

All thresholds and limits are configurable via environment variables
to allow tuning without code changes.  Mirrors the Step 1 (PyMuPDF)
configuration so that the two implementations can be compared fairly.
"""

import os


# ---------------------------------------------------------------------------
# OCR decision threshold
# ---------------------------------------------------------------------------
# Minimum number of *stripped* characters on a page for it to be considered
# "native text" (i.e. no OCR needed).  Pages below this threshold are sent
# to Tesseract OCR.
#
# This matches the Step 1 default so the comparison is apples-to-apples.
# ---------------------------------------------------------------------------
MIN_NATIVE_TEXT_CHARS: int = int(os.getenv("MIN_NATIVE_TEXT_CHARS", "50"))

# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------
# DPI used when rendering a page to an image for OCR.
# 200 DPI matches Step 1 so OCR quality and speed are directly comparable.
# PDFium's scale factor = DPI / 72  (1 PDF unit = 1/72 inch).
OCR_DPI: int = int(os.getenv("OCR_DPI", "200"))

# ---------------------------------------------------------------------------
# Upload limits (relevant only if an HTTP endpoint is added later)
# ---------------------------------------------------------------------------
MAX_UPLOAD_BYTES: int = int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024)))
