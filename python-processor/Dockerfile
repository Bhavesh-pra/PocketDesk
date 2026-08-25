FROM python:3.12-slim

# ── OS-level dependencies ─────────────────────────────────────────────────
# Tesseract OCR engine + English trained data
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ──────────────────────────────────────────────────
WORKDIR /service

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ─────────────────────────────────────────────────────
COPY app/ app/

# ── Runtime ──────────────────────────────────────────────────────────────
EXPOSE 8000

# Default configuration (override via docker run -e or .env)
ENV MIN_NATIVE_TEXT_CHARS=50
ENV OCR_DPI=200
ENV MAX_UPLOAD_BYTES=52428800
ENV HOST=0.0.0.0
ENV PORT=8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
