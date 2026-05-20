from pydantic import BaseModel, Field


class CodeUploadResponse(BaseModel):
    filename: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
