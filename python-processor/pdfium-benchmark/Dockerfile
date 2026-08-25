FROM python:3.12-slim

# ── OS-level dependencies ─────────────────────────────────────────────────
# Tesseract OCR engine + English trained data
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ──────────────────────────────────────────────────
WORKDIR /benchmark

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ─────────────────────────────────────────────────────
COPY config.py .
COPY pdfium_extractor.py .
COPY pdfium_ocr.py .
COPY pdfium_processor.py .
COPY cli.py .

# ── Runtime ──────────────────────────────────────────────────────────────
# Default configuration (override via docker run -e)
ENV MIN_NATIVE_TEXT_CHARS=50
ENV OCR_DPI=200
ENV MAX_UPLOAD_BYTES=52428800

# Note: pypdfium2 bundles the PDFium binary for the target platform.
# On Linux (this container), it downloads / includes the Linux-compatible
# PDFium shared library automatically.  No separate native library
# installation is required.

# Default entry point runs the CLI.
# Mount a PDF via -v and pass the container path as an argument:
#   docker run -v /host/path/test.pdf:/data/test.pdf pdfium-benchmark /data/test.pdf
ENTRYPOINT ["python", "cli.py"]
