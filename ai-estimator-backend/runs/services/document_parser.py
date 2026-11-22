from pathlib import Path
from io import BytesIO

from docx import Document as WordDocument
from pypdf import PdfReader


def extract_document_text(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        text = "\n".join(
            page.extract_text() or "" for page in PdfReader(BytesIO(content)).pages
        )
    elif suffix == ".docx":
        document = WordDocument(BytesIO(content))
        parts = [
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ]
        for table in document.tables:
            parts.extend(
                " | ".join(cell.text.strip() for cell in row.cells)
                for row in table.rows
            )
        text = "\n".join(parts)
    elif suffix in {".txt", ".md", ".markdown"}:
        text = content.decode("utf-8-sig", errors="replace")
    elif suffix == ".doc":
        raise ValueError(
            "Legacy .doc files are not supported. Save the file as .docx or PDF and upload it again."
        )
    else:
        raise ValueError(
            "Supported requirement files are PDF, DOCX, TXT, and Markdown."
        )
    text = "\n".join(line.rstrip() for line in text.splitlines()).strip()
    if not text:
        raise ValueError(
            "No readable text was found in the document. Scanned PDFs need OCR before estimation."
        )
    return text
