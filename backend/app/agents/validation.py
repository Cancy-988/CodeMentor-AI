from typing import Any

from app.services.validation import validate_review_payload


def validate_review(review: dict[str, Any], code: str, language: str, retrieved_context: str = "") -> dict[str, Any]:
    return validate_review_payload(review, code, language, retrieved_context).model_dump()
