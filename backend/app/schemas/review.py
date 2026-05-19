from typing import Literal

from pydantic import BaseModel, Field


class CodeReviewRequest(BaseModel):
    language: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=1, max_length=20000)


class LanguageDetectionResult(BaseModel):
    detected_language: str
    confidence: Literal["low", "medium", "high"]
    explanation: str


class CodeIssue(BaseModel):
    title: str
    explanation: str
    severity: Literal["low", "medium", "high"]
    fix: str


class BugDetectionResult(BaseModel):
    summary: str
    issues: list[CodeIssue]


class FixSuggestionResult(BaseModel):
    recommended_fix: str
    alternatives: list[str]
    improved_code: str


class ComplexityAnalysisResult(BaseModel):
    time_complexity: str
    space_complexity: str
    explanation: str


class ExplanationResult(BaseModel):
    simple_explanation: str
    key_takeaways: list[str]


class CodeReviewResponse(BaseModel):
    input_language: str
    language_detection: LanguageDetectionResult
    bug_detection: BugDetectionResult
    fix_suggestion: FixSuggestionResult
    complexity_analysis: ComplexityAnalysisResult
    explanation: ExplanationResult
    final_summary: str
    next_steps: list[str]