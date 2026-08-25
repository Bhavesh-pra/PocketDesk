#!/usr/bin/env python3
"""
CLI entry point for the PDFium benchmark PDF processor.

Usage:
    python cli.py <path-to-pdf>
    python cli.py <path-to-pdf> --full-text
    python cli.py <path-to-pdf> --full-text --output result.json

Outputs JSON diagnostics to stdout.  Designed for Codex to invoke
directly for independent benchmarking.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys

# Ensure the benchmark directory is on the path when run directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdfium_processor import process_pdf


def main() -> None:
    parser = argparse.ArgumentParser(
        description="PocketDesk PDFium Benchmark — PDF text extraction",
    )
    parser.add_argument(
        "pdf_path",
        help="Path to the PDF file to process.",
    )
    parser.add_argument(
        "--full-text",
        action="store_true",
        default=False,
        help="Include the complete extracted text in the output (can be large).",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default=None,
        help="Write JSON output to a file instead of stdout.",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        default=False,
        help="Enable verbose logging to stderr.",
    )
    args = parser.parse_args()

    # ── Logging ───────────────────────────────────────────────────────────
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        stream=sys.stderr,
    )

    # ── Validate input ────────────────────────────────────────────────────
    pdf_path = os.path.abspath(args.pdf_path)
    if not os.path.isfile(pdf_path):
        print(
            json.dumps({"success": False, "error": f"File not found: {pdf_path}"}),
            file=sys.stderr,
        )
        sys.exit(1)

    # ── Process ───────────────────────────────────────────────────────────
    try:
        result = process_pdf(pdf_path)
    except ValueError as exc:
        output = {
            "success": False,
            "error": "Unable to process PDF",
            "details": str(exc),
        }
        _write_output(output, args.output)
        sys.exit(1)
    except Exception as exc:
        output = {
            "success": False,
            "error": "Unexpected error",
            "details": str(exc),
        }
        _write_output(output, args.output)
        sys.exit(1)

    # ── Build output ──────────────────────────────────────────────────────
    output = {
        "success": True,
        "engine": "pypdfium2 + PDFium",
        "pages": result.total_pages,
        "ocr_pages": result.ocr_page_numbers,
        "ocr_page_count": len(result.ocr_page_numbers),
        "native_text_pages": result.native_text_page_count,
        "pages_with_no_text": result.pages_with_no_text,
        "text_length": len(result.text),
        "text_preview": result.text[:500] if result.text else "",
        "processing_time_seconds": round(result.total_time, 3),
        "diagnostics": {
            "ocr_time_seconds": round(result.ocr_time, 3),
            "native_extraction_time_seconds": round(result.native_time, 3),
            "tesseract_available": result.tesseract_available,
            "average_ocr_time_per_page": (
                round(result.ocr_time / len(result.ocr_page_numbers), 3)
                if result.ocr_page_numbers
                else 0.0
            ),
        },
    }

    if args.full_text:
        output["text"] = result.text

    _write_output(output, args.output)


def _write_output(data: dict, output_path: str | None) -> None:
    """Write JSON output to a file or stdout."""
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json_str)
            f.write("\n")
        print(f"Output written to: {output_path}", file=sys.stderr)
    else:
        print(json_str)


if __name__ == "__main__":
    main()
