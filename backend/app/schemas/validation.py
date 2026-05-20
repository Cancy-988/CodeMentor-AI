from typing import Literal

from pydantic import BaseModel


class ValidationFinding(BaseModel):
    category: Literal["syntax", "rag_alignment", "hallucination", "fix_quality"]
    severity: Literal["low", "medium", "high"]
    message: str


class ValidationResult(BaseModel):
    passed: bool
    syntax_ok: bool
    rag_aligned: bool
    hallucination_risk: Literal["low", "medium", "high"]
    findings: list[ValidationFinding]
