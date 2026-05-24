from pydantic import BaseModel, Field


class CodeUploadResponse(BaseModel):
    filename: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)


class UploadResponse(BaseModel):
    filename: str = Field(..., min_length=1)
    file_type: str = Field(...)
    mime_type: str | None = None
    extracted_text: str | None = None
    meta: dict | None = None
