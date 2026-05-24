from __future__ import annotations

from io import BytesIO
from typing import Tuple, Any


def _try_pytesseract_extract(image_bytes: bytes) -> Tuple[str, dict[str, Any]]:
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip(), {"method": "pytesseract"}
    except Exception as error:
        return "", {"error": str(error), "method": "pytesseract"}


def extract_text_from_image_bytes(image_bytes: bytes) -> Tuple[str, dict[str, Any]]:
    """Attempt to extract text from image bytes.

    Strategy:
    1. Try local pytesseract (Pillow + pytesseract).
    2. (Future) Try Gemini Vision if configured.

    Returns: (extracted_text, metadata)
    """
    # First, try pytesseract
    text, meta = _try_pytesseract_extract(image_bytes)
    if text:
        return text, meta

    # If pytesseract failed or produced empty text, indicate the fallback state
    return "", {"error": "No OCR available or produced no text", **meta}
