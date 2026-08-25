"""
Integration tests for the PDF processing API.

Tests use PyMuPDF to programmatically generate test PDFs so there are no
external fixture dependencies.  All PDFs are created in-memory or in
temporary files and cleaned up automatically.

Run:  pytest tests/test_api.py -v
"""

from __future__ import annotations

import io
import os
import tempfile

import pypdfium2 as pdfium
import pytest
from httpx import ASGITransport, AsyncClient
from PIL import Image, ImageDraw

from app.main import app
from app.services.ocr_service import is_tesseract_available

# ---------------------------------------------------------------------------
# Helpers — synthetic PDF generators (pypdfium2 + Pillow)
# ---------------------------------------------------------------------------

def _make_page_bytes(text: str) -> bytes:
    stream_content = f"BT /F1 12 Tf 72 712 Td ({text}) Tj ET\n"
    stream_bytes = stream_content.encode("utf-8")
    return (
        f"%PDF-1.4\n"
        f"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        f"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        f"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj\n"
        f"4 0 obj <</Length {len(stream_bytes)}>> stream\n"
        f"{stream_content}"
        f"endstream\n"
        f"endobj\n"
        f"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        f"xref\n0 6\n0000000000 65535 f \n"
        f"trailer <</Size 6 /Root 1 0 R>>\n"
        f"startxref\n0\n%%EOF"
    ).encode("utf-8")


def _make_text_pdf(pages: int = 5, chars_per_page: int = 200) -> bytes:
    """Create a PDF with native (embedded) text on every page."""
    doc = pdfium.PdfDocument.new()
    for i in range(pages):
        text = f"Page {i + 1}. " + ("Lorem ipsum dolor sit amet. " * (chars_per_page // 28))
        page_pdf = pdfium.PdfDocument(_make_page_bytes(text))
        doc.import_pages(page_pdf)
        page_pdf.close()
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def _make_image_pdf(pages: int = 2) -> bytes:
    """Create a PDF where each page is a rasterised image of text."""
    images = []
    for i in range(pages):
        img = Image.new("RGB", (612, 792), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((72, 200), f"Scanned page {i + 1}: This text should only be recoverable via OCR.", fill=(0, 0, 0))
        images.append(img)
    buf = io.BytesIO()
    images[0].save(buf, format="PDF", save_all=True, append_images=images[1:])
    return buf.getvalue()


def _make_mixed_pdf(text_pages: int = 3, image_pages: int = 2) -> bytes:
    """Create a PDF with a mix of native-text pages and image-only pages."""
    doc = pdfium.PdfDocument.new()
    for i in range(text_pages):
        text = f"Native text page {i + 1}. " + ("The quick brown fox jumps over the lazy dog. " * 6)
        page_pdf = pdfium.PdfDocument(_make_page_bytes(text))
        doc.import_pages(page_pdf)
        page_pdf.close()

    img_bytes = _make_image_pdf(image_pages)
    img_pdf = pdfium.PdfDocument(img_bytes)
    doc.import_pages(img_pdf)
    img_pdf.close()

    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ---------------------------------------------------------------------------
# Test 1 — Native text PDF
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_native_text_pdf(client):
    """All pages have embedded text → 0 OCR pages."""
    pdf_bytes = _make_text_pdf(pages=5)

    resp = await client.post(
        "/process/pdf",
        files={"file": ("test.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["pages"] == 5
    assert data["ocr_pages"] == []
    assert data["native_text_pages"] == 5
    assert len(data["text"]) > 0


# ---------------------------------------------------------------------------
# Test 2 — Scanned (image-only) PDF
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_scanned_pdf(client):
    """Pages are images → OCR should trigger for every page."""
    if not is_tesseract_available():
        pytest.skip("Tesseract not available")

    pdf_bytes = _make_image_pdf(pages=2)

    resp = await client.post(
        "/process/pdf",
        files={"file": ("scanned.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["pages"] == 2
    assert len(data["ocr_pages"]) > 0  # At least some pages needed OCR
    assert len(data["text"]) > 0


# ---------------------------------------------------------------------------
# Test 3 — Mixed PDF (native + scanned)
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_mixed_pdf(client):
    """
    Mix of text and image pages.
    Native pages should NOT be sent to OCR.
    """
    if not is_tesseract_available():
        pytest.skip("Tesseract not available")

    pdf_bytes = _make_mixed_pdf(text_pages=3, image_pages=2)

    resp = await client.post(
        "/process/pdf",
        files={"file": ("mixed.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["pages"] == 5
    assert data["native_text_pages"] == 3
    # OCR pages should be a subset, not all 5
    assert len(data["ocr_pages"]) <= 2
    assert len(data["text"]) > 0


# ---------------------------------------------------------------------------
# Test 4 — Large PDF (50 pages, automated)
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_large_pdf(client):
    """50-page native PDF processes quickly and returns correct diagnostics."""
    pdf_bytes = _make_text_pdf(pages=50)

    resp = await client.post(
        "/process/pdf",
        files={"file": ("large.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["pages"] == 50
    assert data["ocr_pages"] == []
    assert data["native_text_pages"] == 50
    # Should be fast — pure native extraction
    assert data["processing_time_seconds"] < 30


# ---------------------------------------------------------------------------
# Test 5 — Invalid / malformed file
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_invalid_file(client):
    """Non-PDF data should return a structured error."""
    resp = await client.post(
        "/process/pdf",
        files={"file": ("bad.pdf", b"this is not a pdf at all", "application/pdf")},
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data["success"] is False
    assert "error" in data
    assert "details" in data
    assert data["error"] == "Unable to process PDF"
    assert "Cannot open PDF" in data["details"]


@pytest.mark.anyio
async def test_wrong_extension(client):
    """A file with a non-.pdf extension should be rejected."""
    resp = await client.post(
        "/process/pdf",
        files={"file": ("image.png", b"fake", "image/png")},
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data["success"] is False
    assert "error" in data
    assert "details" in data
    assert "Invalid file extension" in data["details"]


@pytest.mark.anyio
async def test_empty_upload(client):
    """An empty file should be rejected."""
    resp = await client.post(
        "/process/pdf",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data["success"] is False
    assert "error" in data
    assert "details" in data
    assert "empty" in data["details"]


@pytest.mark.anyio
async def test_encrypted_or_corrupt_pdf(client):
    """A header-only truncated PDF should fail gracefully with structured error."""
    resp = await client.post(
        "/process/pdf",
        files={"file": ("corrupt.pdf", b"%PDF-1.4\n%EOF", "application/pdf")},
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data["success"] is False
    assert data["error"] == "Unable to process PDF"
    assert "details" in data


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "pdfium_version" in data
    assert "tesseract_available" in data

