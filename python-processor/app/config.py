"""
Configuration for the PDF processing service.

All thresholds and limits are configurable via environment variables
to allow tuning without code changes.
"""

import os


# ---------------------------------------------------------------------------
# OCR decision threshold
# ---------------------------------------------------------------------------
# Minimum number of *stripped* characters on a page for it to be considered
# "native text" (i.e. no OCR needed).  Pages below this threshold are sent
# to OCR.
#
# NOTE:  A character-count heuristic is a baseline.  Short headings like
# "Chapter 1" (9 chars) would fall below 50 and trigger OCR, which is
# harmless but wasteful.  A future improvement could factor in text-density
# relative to page dimensions (chars-per-point²), but for Step 1 this
# simple threshold is acceptable and matches the previous Node.js logic
# (except it is now applied *per page* instead of per document).
# ---------------------------------------------------------------------------
MIN_NATIVE_TEXT_CHARS: int = int(os.getenv("MIN_NATIVE_TEXT_CHARS", "50"))

# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------
# DPI used when rendering a page to an image for OCR.
# 200 is ~45% fewer pixels than 300 and is sufficient for Tesseract on
# typical scanned documents.  Bump to 300 only if accuracy is poor.
OCR_DPI: int = int(os.getenv("OCR_DPI", "200"))

# ---------------------------------------------------------------------------
# Upload limits
# ---------------------------------------------------------------------------
# Maximum upload size in bytes (default 50 MB, matching the Node backend).
MAX_UPLOAD_BYTES: int = int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024)))

# ---------------------------------------------------------------------------
# Server & Security
# ---------------------------------------------------------------------------
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# Shared secret token for authenticating service-to-service requests.
PYTHON_SERVICE_TOKEN: str = os.getenv("PYTHON_SERVICE_TOKEN", "")
