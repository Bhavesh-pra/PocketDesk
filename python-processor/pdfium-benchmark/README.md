# PocketDesk — PDFium Benchmark Processor

## Purpose

This is an **isolated benchmark implementation** of a PDF text extraction
service using **pypdfium2 / PDFium** as an alternative to the existing
Step 1 **PyMuPDF** implementation.

It exists solely for A/B comparison.  It does **not** replace the
existing production service at `python-processor/app/`.

---

## Architecture

```
PDF File
 │
 ▼
pdfium_extractor.open_pdf()          ← Open PDF via PDFium
 │
 ▼
For each page:
 │
 ├─ pdfium_extractor.extract_page_text()   ← Native text via PDFium
 │   │
 │   ▼
 │   len(text.strip()) >= MIN_NATIVE_TEXT_CHARS ?
 │   │
 │   ├── YES → use native text
 │   │
 │   └── NO  → pdfium_ocr.ocr_page()
 │              │
 │              ├── PDFium render (scale = DPI / 72)
 │              ├── bitmap → PIL Image
 │              ├── pytesseract.image_to_string()
 │              └── release bitmap + image
 │
 ▼
Combine page texts → ProcessingResult
```

### Processing Decision Flow

The OCR decision is made **per page**, not per document:

| Page Content        | Decision             |
|---------------------|----------------------|
| Rich selectable text| Native extraction    |
| Scanned image       | Render + Tesseract   |
| Short heading only  | Render + Tesseract   |

This matches the Step 1 (PyMuPDF) implementation exactly.

---

## Module Structure

| File                   | Purpose                                       |
|------------------------|-----------------------------------------------|
| `config.py`            | Environment-configurable settings             |
| `pdfium_extractor.py`  | PDF open/validate + native text extraction     |
| `pdfium_ocr.py`        | Page rendering (PDFium) + OCR (Tesseract)     |
| `pdfium_processor.py`  | Orchestrator — page-level decision + assembly |
| `cli.py`               | CLI entry point for benchmarking              |
| `requirements.txt`     | Pinned Python dependencies                    |
| `Dockerfile`           | Linux Docker image definition                 |

---

## Dependencies & Licenses

| Package      | Version            | License                          | Purpose                                 |
|--------------|--------------------|----------------------------------|-----------------------------------------|
| pypdfium2    | 5.13.0             | Apache-2.0 / BSD-3-Clause       | Python bindings for PDFium              |
| PDFium       | (bundled by pypdfium2) | BSD-3-Clause                 | Underlying PDF rendering/text engine    |
| pytesseract  | 0.3.13             | Apache-2.0                       | Python wrapper for Tesseract OCR binary |
| Tesseract    | (OS package)       | Apache-2.0                       | OCR engine                              |
| Pillow       | 11.2.1             | HPND                             | Image handling for OCR pipeline         |

### Important License Note

pypdfium2 and PDFium use permissive licenses (Apache-2.0, BSD-3-Clause).
However, **PDFium's bundled third-party dependencies have additional
licenses** that must be preserved and reviewed before production
distribution.

The pypdfium2 project provides the relevant license information in
`BUILD_LICENSES/` within the wheel distribution.  The exact dependency
set and associated licenses can change between builds and versions.

**Before production use**, the actual installed wheel's bundled license
files must be inspected and preserved.  Codex should verify the specific
licenses included in the pypdfium2==5.13.0 wheel as part of the
independent verification step.

This implementation **does not make a final legal determination** about
license compatibility.  It documents what is publicly available from
authoritative package metadata.

---

## Configuration

All settings are configurable via environment variables:

| Variable                | Default    | Description                                |
|-------------------------|------------|--------------------------------------------|
| `MIN_NATIVE_TEXT_CHARS` | `50`       | Characters threshold for native vs OCR     |
| `OCR_DPI`               | `200`      | DPI for page rendering before OCR          |
| `MAX_UPLOAD_BYTES`      | `52428800` | Max upload size (50 MB, for future HTTP)   |

---

## How to Run

### Local Execution

```bash
# From the pdfium-benchmark directory
cd python-processor/pdfium-benchmark

# Install dependencies (use a venv if preferred)
pip install -r requirements.txt

# Process a PDF — JSON diagnostics to stdout
python cli.py /path/to/test.pdf

# Include full extracted text in output
python cli.py /path/to/test.pdf --full-text

# Write output to a file
python cli.py /path/to/test.pdf --full-text --output result.json

# Verbose logging (to stderr)
python cli.py /path/to/test.pdf --verbose
```

**Requirements for local execution:**
- Python 3.10+
- Tesseract OCR binary on PATH (`tesseract --version` must work)
- English Tesseract language data installed

### Docker Execution

```bash
# From the pdfium-benchmark directory
cd python-processor/pdfium-benchmark

# Build the image
docker build -t pdfium-benchmark .

# Process a PDF (mount the file into the container)
docker run --rm -v /host/path/test.pdf:/data/test.pdf pdfium-benchmark /data/test.pdf

# With full text output
docker run --rm -v /host/path/test.pdf:/data/test.pdf pdfium-benchmark /data/test.pdf --full-text

# Override configuration
docker run --rm \
  -e MIN_NATIVE_TEXT_CHARS=30 \
  -e OCR_DPI=300 \
  -v /host/path/test.pdf:/data/test.pdf \
  pdfium-benchmark /data/test.pdf

# Save output to host
docker run --rm \
  -v /host/path/test.pdf:/data/test.pdf \
  -v /host/path/output:/output \
  pdfium-benchmark /data/test.pdf --full-text --output /output/result.json
```

### Docker Linux Dependencies

The Dockerfile installs:
- **Python 3.12** (python:3.12-slim base)
- **Tesseract** via `apt-get install tesseract-ocr tesseract-ocr-eng`
- **pypdfium2** via pip — this package bundles the PDFium shared library
  for the target platform (Linux x86_64 in the Docker image), so no
  separate native library installation is needed
- **pytesseract** + **Pillow** via pip

---

## Output Format

The CLI outputs JSON with the following structure:

```json
{
  "success": true,
  "engine": "pypdfium2 + PDFium",
  "pages": 5,
  "ocr_pages": [2, 4],
  "ocr_page_count": 2,
  "native_text_pages": 3,
  "pages_with_no_text": 0,
  "text_length": 8421,
  "text_preview": "First 500 characters of extracted text...",
  "processing_time_seconds": 12.345,
  "diagnostics": {
    "ocr_time_seconds": 10.200,
    "native_extraction_time_seconds": 0.045,
    "tesseract_available": true,
    "average_ocr_time_per_page": 5.100
  }
}
```

With `--full-text`, the complete extracted text is included in the `"text"` field.

On failure:

```json
{
  "success": false,
  "error": "Unable to process PDF",
  "details": "Cannot open PDF: ..."
}
```

---

## Comparison with Step 1 (PyMuPDF)

| Aspect             | Step 1 (PyMuPDF)      | This (PDFium)         |
|--------------------|-----------------------|-----------------------|
| PDF engine         | PyMuPDF / MuPDF       | pypdfium2 / PDFium    |
| OCR engine         | Tesseract             | Tesseract             |
| OCR DPI            | 200                   | 200                   |
| Decision level     | Per page              | Per page              |
| Threshold          | 50 chars              | 50 chars              |
| Text extraction    | `page.get_text()`     | `textpage.get_text_bounded()` |
| Page rendering     | `page.get_pixmap()`   | `page.render()`       |
| License concern    | AGPL (PyMuPDF)        | Permissive (see note) |

---

## Known Limitations

1. **No HTTP endpoint** — this is a CLI-only benchmark tool, not a
   production service.  Production integration (Step 2) will be done
   separately after the benchmark comparison.

2. **No parallelism** — pages are processed sequentially for a
   deterministic baseline.

3. **pypdfium2 version 5.13.0** — this version was installed locally
   but may not be the latest on PyPI.  Codex should verify the actual
   wheel contents and bundled licenses.

4. **Native text quality** — `get_text_bounded()` may produce different
   text ordering or whitespace compared to PyMuPDF's `get_text("text")`.
   This is expected and part of what the benchmark measures.

5. **Encrypted PDFs** — pypdfium2 raises `PdfiumError` for encrypted
   PDFs, which is caught and reported as a `ValueError`.  No password
   support is implemented.

6. **Thread safety** — PDFium is not thread-safe.  This implementation
   processes one PDF at a time, which is correct for benchmarking.

---

## Testing Status

> **Independent benchmark/testing has NOT been performed by this
> implementation task.**

This implementation was created by Antigravity.  Independent verification
and benchmarking will be performed separately by Codex.

Do not treat the existence of this code as proof of correctness or
performance.
