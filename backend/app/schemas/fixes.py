from datetime import datetime

from pydantic import BaseModel, Field


class FixSuggestionRequest(BaseModel):
    original_code: str = Field(..., min_length=1)
    language: str | None = None


class FixSuggestionResponse(BaseModel):
    id: int | None = None
    user_id: int | None = None
    chat_id: int | None = None
    review_id: int | None = None
    original_code: str
    fixed_code: str
    explanation: str | None = None
    validation_json: dict | None = None
    created_at: datetime | None = None


class FixValidationResponse(BaseModel):
    validation_json: dict
