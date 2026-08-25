# PocketDesk — Python PDF Processing Service

Standalone PDF text extraction service with **page-level OCR**.  
Accepts a PDF via HTTP, extracts text using PDFium (pypdfium2) for native content and Tesseract (pytesseract) for scanned pages, and returns structured JSON with full diagnostics.

## Architecture

```
python-processor/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Configurable thresholds (env vars)
│   ├── api/
│   │   └── pdf.py            # POST /process/pdf route
│   ├── services/
│   │   ├── pdf_processor.py  # Page-level orchestrator
│   │   ├── pdf_extractor.py  # Native text extraction (pypdfium2 / PDFium)
│   │   └── ocr_service.py    # Tesseract OCR via pytesseract
│   └── schemas/
│       └── pdf.py            # Pydantic response models
├── tests/
│   ├── test_api.py           # Integration tests
│   └── test_benchmark.py     # Performance benchmarks
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## Quick Start (Local)

### Prerequisites

- Python 3.10+
- Tesseract OCR (optional for native-text-only PDFs, required for scanned PDFs)

**Install Tesseract:**

```bash
# Ubuntu / Debian
sudo apt-get install tesseract-ocr tesseract-ocr-eng

# macOS
brew install tesseract

# Windows — download installer from https://github.com/UB-Mannheim/tesseract/wiki
# and add to PATH
```

### Setup

```bash
cd python-processor

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt
```

### Run the Service

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Test the API

```bash
# Health check
curl http://localhost:8000/health

# Process a PDF
curl -X POST http://localhost:8000/process/pdf \
  -F "file=@path/to/document.pdf"
```

## Docker

```bash
# Build
docker build -t pocketdesk-pdf-processor .

# Run
docker run -p 8000:8000 pocketdesk-pdf-processor

# With custom config
docker run -p 8000:8000 \
  -e MIN_NATIVE_TEXT_CHARS=30 \
  -e OCR_DPI=300 \
  pocketdesk-pdf-processor
```

## Configuration

All settings are configurable via environment variables:

| Variable | Default | Description |
|---|---|---|
| `MIN_NATIVE_TEXT_CHARS` | `50` | Minimum stripped chars per page to skip OCR |
| `OCR_DPI` | `200` | DPI for page rendering before OCR |
| `MAX_UPLOAD_BYTES` | `52428800` | Maximum upload size (50 MB) |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |

## API

### `GET /health`

```json
{
  "status": "ok",
  "tesseract_available": true,
  "pdfium_version": "5.13.0"
}
```

### `POST /process/pdf`

**Request:** `multipart/form-data` with field `file` containing a PDF.

**Success (200):**

```json
{
  "success": true,
  "text": "extracted document text...",
  "pages": 200,
  "ocr_pages": [3, 7, 8, 41],
  "native_text_pages": 196,
  "processing_time_seconds": 12.4,
  "diagnostics": {
    "ocr_time_seconds": 4.2,
    "native_extraction_time_seconds": 0.8,
    "pages_with_no_text": 0,
    "tesseract_available": true
  }
}
```

**Error (400/500):**

```json
{
  "success": false,
  "error": "Unable to process PDF",
  "details": "File is encrypted or corrupted"
}
```

## Testing

```bash
# Run all tests
pytest tests/test_api.py -v

# Run benchmarks (synthetic PDFs)
python tests/test_benchmark.py

# Benchmark a real PDF
python tests/test_benchmark.py path/to/real.pdf
```

## Processing Logic

For each page in the PDF:

1. Extract native text via PDFium (`pypdfium2` textpage bounded extraction)
2. If `len(text.strip()) >= MIN_NATIVE_TEXT_CHARS` → use native text
3. Else → render page at `OCR_DPI` → Tesseract OCR → use OCR text
4. Combine all page texts in order

Only pages that actually need OCR are processed by OCR.

