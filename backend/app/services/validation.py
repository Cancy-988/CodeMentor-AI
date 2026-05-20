from __future__ import annotations

import ast
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from app.schemas.validation import ValidationFinding, ValidationResult

STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "into",
    "your",
    "code",
    "review",
    "fix",
    "issue",
    "issues",
    "agent",
    "simple",
    "clear",
    "short",
    "likely",
    "possible",
    "because",
    "should",
    "would",
    "could",
    "does",
    "doesn",
    "not",
    "have",
    "been",
    "are",
    "was",
    "were",
    "when",
    "then",
    "than",
    "what",
    "where",
    "why",
    "how",
    "one",
    "two",
    "use",
    "using",
    "make",
    "made",
    "can",
    "may",
    "will",
    "would",
    "need",
    "needs",
    "shouldn",
}

TOKEN_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]+")


def _normalize_language(language: str) -> str:
    return (language or "").strip().lower()


def _tokenize(text: str) -> set[str]:
    tokens = set()
    for token in TOKEN_RE.findall(text.lower()):
        if token not in STOPWORDS and len(token) > 2:
            tokens.add(token)
    return tokens


def _extract_review_text(review: dict[str, Any]) -> str:
    parts: list[str] = []

    parts.append(str(review.get("final_summary", "")))

    bug_detection = review.get("bug_detection", {})
    if isinstance(bug_detection, dict):
        parts.append(str(bug_detection.get("summary", "")))
        for issue in bug_detection.get("issues", []):
            if isinstance(issue, dict):
                parts.append(str(issue.get("title", "")))
                parts.append(str(issue.get("explanation", "")))
                parts.append(str(issue.get("fix", "")))

    fix_suggestion = review.get("fix_suggestion", {})
    if isinstance(fix_suggestion, dict):
        parts.append(str(fix_suggestion.get("recommended_fix", "")))
        parts.extend(str(item) for item in fix_suggestion.get("alternatives", []) if item)
        parts.append(str(fix_suggestion.get("improved_code", "")))

    explanation = review.get("explanation", {})
    if isinstance(explanation, dict):
        parts.append(str(explanation.get("simple_explanation", "")))
        parts.extend(str(item) for item in explanation.get("key_takeaways", []) if item)

    return "\n".join(part for part in parts if part)


def _check_python_syntax(code: str) -> tuple[bool, str]:
    try:
        ast.parse(code)
    except SyntaxError as error:
        return False, f"Python syntax error: {error.msg} (line {error.lineno}, column {error.offset})"
    return True, ""


def _check_js_syntax_with_node(code: str) -> tuple[bool, str]:
    if not shutil.which("node"):
        return _check_balanced_delimiters(code)

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir) / "snippet.js"
        temp_path.write_text(code, encoding="utf-8")

        completed = subprocess.run(
            ["node", "--check", str(temp_path)],
            capture_output=True,
            text=True,
        )

    if completed.returncode == 0:
        return True, ""

    error_output = (completed.stderr or completed.stdout or "JavaScript syntax check failed.").strip()
    return False, error_output


def _check_balanced_delimiters(code: str) -> tuple[bool, str]:
    pairs = {"(": ")", "[": "]", "{": "}"}
    closing = {v: k for k, v in pairs.items()}
    stack: list[str] = []
    in_single = False
    in_double = False
    in_backtick = False
    escaped = False

    for character in code:
        if escaped:
            escaped = False
            continue

        if character == "\\":
            escaped = True
            continue

        if character == "'" and not in_double and not in_backtick:
            in_single = not in_single
            continue

        if character == '"' and not in_single and not in_backtick:
            in_double = not in_double
            continue

        if character == "`" and not in_single and not in_double:
            in_backtick = not in_backtick
            continue

        if in_single or in_double or in_backtick:
            continue

        if character in pairs:
            stack.append(character)
            continue

        if character in closing:
            if not stack or stack[-1] != closing[character]:
                return False, "Unbalanced delimiters were detected in the generated code."
            stack.pop()

    if in_single or in_double or in_backtick:
        return False, "An opening quote or template string was not closed."

    if stack:
        return False, "A bracket, parenthesis, or brace was not closed."

    return True, ""


def _check_syntax(code: str, language: str) -> tuple[bool, str]:
    normalized_language = _normalize_language(language)

    if normalized_language in {"python", "py"}:
        return _check_python_syntax(code)

    if normalized_language in {"javascript", "js"}:
        return _check_js_syntax_with_node(code)

    if normalized_language in {"typescript", "ts", "jsx", "tsx", "java"}:
        return _check_balanced_delimiters(code)

    return _check_balanced_delimiters(code)


def _calculate_overlap_ratio(text: str, reference: str) -> float:
    text_tokens = _tokenize(text)
    reference_tokens = _tokenize(reference)

    if not text_tokens or not reference_tokens:
        return 0.0

    overlap = text_tokens.intersection(reference_tokens)
    return len(overlap) / max(len(text_tokens), 1)


def validate_review_payload(
    review: dict[str, Any],
    code: str,
    language: str,
    retrieved_context: str = "",
) -> ValidationResult:
    findings: list[ValidationFinding] = []

    fix_suggestion = review.get("fix_suggestion", {})
    improved_code = ""
    if isinstance(fix_suggestion, dict):
        improved_code = str(fix_suggestion.get("improved_code", "")).strip()

    syntax_ok = True
    syntax_message = ""
    code_to_check = improved_code or code
    if code_to_check.strip():
        syntax_ok, syntax_message = _check_syntax(code_to_check, language)

    if not syntax_ok:
        findings.append(
            ValidationFinding(
                category="syntax",
                severity="high",
                message=syntax_message or "The generated fix does not pass a basic syntax check.",
            )
        )

    review_text = _extract_review_text(review)
    rag_aligned = True

    if retrieved_context.strip():
        overlap_ratio = _calculate_overlap_ratio(review_text, retrieved_context)
        if overlap_ratio < 0.08:
            rag_aligned = False
            findings.append(
                ValidationFinding(
                    category="rag_alignment",
                    severity="medium",
                    message=(
                        "The response has very little overlap with the retrieved RAG context, "
                        "so the explanation may not be grounded in the supplied material."
                    ),
                )
            )
    else:
        findings.append(
            ValidationFinding(
                category="rag_alignment",
                severity="low",
                message="No retrieved context was available, so RAG alignment could not be fully checked.",
            )
        )

    hallucination_risk = "low"
    if not retrieved_context.strip():
        hallucination_risk = "medium"
    else:
        overlap_ratio = _calculate_overlap_ratio(review_text, retrieved_context)
        if overlap_ratio < 0.08:
            hallucination_risk = "high"
        elif overlap_ratio < 0.18:
            hallucination_risk = "medium"

    if hallucination_risk != "low":
        findings.append(
            ValidationFinding(
                category="hallucination",
                severity="medium" if hallucination_risk == "medium" else "high",
                message=(
                    "The validator cannot fully confirm that every explanation is grounded in the retrieved context, "
                    "so the response should be treated cautiously."
                ),
            )
        )

    if improved_code and not syntax_ok:
        findings.append(
            ValidationFinding(
                category="fix_quality",
                severity="high",
                message="The proposed fix was rejected because the improved code did not pass the syntax check.",
            )
        )

    passed = syntax_ok and rag_aligned and hallucination_risk == "low"

    return ValidationResult(
        passed=passed,
        syntax_ok=syntax_ok,
        rag_aligned=rag_aligned,
        hallucination_risk=hallucination_risk,
        findings=findings,
    )
