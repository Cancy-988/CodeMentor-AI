from typing import Literal

from pydantic import BaseModel, Field


class CodeReviewRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=1, max_length=20000)


class CodeIssue(BaseModel):
    title: str
    explanation: str
    severity: Literal["low", "medium", "high"]
    fix: str


class CodeReviewResponse(BaseModel):
    language: str
    summary: str
    issues: list[CodeIssue]
    suggested_fix: str
    improved_code: str
    next_steps: list[str]