"""
Benchmark script for the PDF processing service.

Generates synthetic PDFs of various types and sizes, processes them
through the service, and prints a detailed performance report.

Also supports benchmarking a real PDF file passed as a CLI argument:

    python tests/test_benchmark.py                  # synthetic only
    python tests/test_benchmark.py path/to/real.pdf  # include real PDF

Run from the python-processor/ directory.
"""

from __future__ import annotations

import os
import sys
import tempfile
import time

# Ensure the app package is importable when running as a script
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import fitz  # PyMuPDF

from app.services.ocr_service import is_tesseract_available
from app.services.pdf_processor import process_pdf


# ──────────────────────────────────────────────────────────────────────────
# Synthetic PDF generators (same as test_api.py but parameterised)
# ──────────────────────────────────────────────────────────────────────────

def make_text_pdf(pages: int) -> str:
    """Create a native-text PDF and return the temp file path."""
    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    doc = fitz.open()
    for i in range(pages):
        page = doc.new_page(width=612, height=792)
        text = f"Page {i + 1}. " + ("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 8)
        page.insert_text((72, 72), text, fontsize=11)
    doc.save(path)
    doc.close()
    return path


def make_image_pdf(pages: int) -> str:
    """Create a scanned (image-only) PDF and return the temp file path."""
    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    doc = fitz.open()
    for i in range(pages):
        tmp = fitz.open()
        tp = tmp.new_page(width=612, height=792)
        tp.insert_text((72, 200), f"Scanned page {i + 1}: OCR benchmark text content here.", fontsize=14)
        pix = tp.get_pixmap(dpi=150)
        img = pix.tobytes("png")
        tmp.close()

        page = doc.new_page(width=612, height=792)
        page.insert_image(page.rect, stream=img)

    doc.save(path)
    doc.close()
    return path


def make_mixed_pdf(text_pages: int, image_pages: int) -> str:
    """Create a mixed PDF and return the temp file path."""
    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    doc = fitz.open()
    for i in range(text_pages):
        page = doc.new_page(width=612, height=792)
        text = f"Native text page {i + 1}. " + ("The quick brown fox jumps over the lazy dog. " * 6)
        page.insert_text((72, 72), text, fontsize=11)

    for i in range(image_pages):
        tmp = fitz.open()
        tp = tmp.new_page(width=612, height=792)
        tp.insert_text((72, 200), f"Image page {text_pages + i + 1}: needs OCR.", fontsize=14)
        pix = tp.get_pixmap(dpi=150)
        img = pix.tobytes("png")
        tmp.close()
        page = doc.new_page(width=612, height=792)
        page.insert_image(page.rect, stream=img)

    doc.save(path)
    doc.close()
    return path


# ──────────────────────────────────────────────────────────────────────────
# Benchmark runner
# ──────────────────────────────────────────────────────────────────────────

def run_benchmark(label: str, pdf_path: str) -> dict:
    """Process a PDF and return a results dict."""
    file_size = os.path.getsize(pdf_path)
    result = process_pdf(pdf_path)

    return {
        "label": label,
        "file_size_kb": round(file_size / 1024, 1),
        "total_pages": result.total_pages,
        "native_pages": result.native_text_page_count,
        "ocr_pages": len(result.ocr_page_numbers),
        "ocr_page_numbers": result.ocr_page_numbers,
        "pages_no_text": result.pages_with_no_text,
        "text_length": len(result.text),
        "total_time_s": round(result.total_time, 3),
        "native_time_s": round(result.native_time, 3),
        "ocr_time_s": round(result.ocr_time, 3),
        "avg_ocr_per_page_s": (
            round(result.ocr_time / len(result.ocr_page_numbers), 3)
            if result.ocr_page_numbers
            else 0
        ),
    }


def print_report(results: list[dict]):
    """Pretty-print the benchmark results table."""
    sep = "=" * 90
    print(f"\n{sep}")
    print("  BENCHMARK RESULTS")
    print(sep)

    header = (
        f"{'Test':<30} {'Pages':>6} {'Native':>7} {'OCR':>5} "
        f"{'Total(s)':>9} {'Native(s)':>10} {'OCR(s)':>8} {'OCR/pg(s)':>10} "
        f"{'Text':>8}"
    )
    print(header)
    print("-" * 90)

    for r in results:
        row = (
            f"{r['label']:<30} {r['total_pages']:>6} {r['native_pages']:>7} "
            f"{r['ocr_pages']:>5} {r['total_time_s']:>9.3f} "
            f"{r['native_time_s']:>10.3f} {r['ocr_time_s']:>8.3f} "
            f"{r['avg_ocr_per_page_s']:>10.3f} {r['text_length']:>8}"
        )
        print(row)
        if r["ocr_page_numbers"]:
            pages_str = ", ".join(str(p) for p in r["ocr_page_numbers"][:20])
            if len(r["ocr_page_numbers"]) > 20:
                pages_str += f" ... (+{len(r['ocr_page_numbers']) - 20} more)"
            print(f"  └─ OCR'd pages: [{pages_str}]")

    print(sep)
    print(f"  Tesseract available: {is_tesseract_available()}")
    print(sep)


def main():
    results = []

    # ── Synthetic benchmarks ─────────────────────────────────────────
    print("\n[1/5] Generating 10-page native text PDF...")
    p = make_text_pdf(10)
    results.append(run_benchmark("10pg native text", p))
    os.unlink(p)

    print("[2/5] Generating 50-page native text PDF...")
    p = make_text_pdf(50)
    results.append(run_benchmark("50pg native text", p))
    os.unlink(p)

    print("[3/5] Generating 200-page native text PDF...")
    p = make_text_pdf(200)
    results.append(run_benchmark("200pg native text", p))
    os.unlink(p)

    if is_tesseract_available():
        print("[4/5] Generating 5-page scanned PDF...")
        p = make_image_pdf(5)
        results.append(run_benchmark("5pg scanned (OCR)", p))
        os.unlink(p)

        print("[5/5] Generating mixed PDF (45 text + 5 image)...")
        p = make_mixed_pdf(45, 5)
        results.append(run_benchmark("50pg mixed (45+5)", p))
        os.unlink(p)
    else:
        print("[4/5] SKIPPED — Tesseract not available")
        print("[5/5] SKIPPED — Tesseract not available")

    # ── Real PDF benchmark (if provided) ─────────────────────────────
    if len(sys.argv) > 1:
        real_path = sys.argv[1]
        if os.path.isfile(real_path):
            print(f"\n[REAL] Benchmarking real PDF: {real_path}")
            results.append(run_benchmark(f"REAL: {os.path.basename(real_path)}", real_path))
        else:
            print(f"\n[REAL] File not found: {real_path}")

    print_report(results)


if __name__ == "__main__":
    main()
