from typing import Any

from app.services.gemini import generate_gemini_json


def detect_bugs(code: str, language: str) -> dict[str, Any]:
    fallback_payload = {
        "summary": "No structured bug analysis could be generated, so a safe fallback is returned.",
        "issues": [],
    }

    prompt = f"""
You are the Bug Detection Agent for CodeMentor AI.

Analyze the {language} code and return ONLY valid JSON with this shape:
{{
  "summary": "simple overview of the main bug risks",
  "issues": [
    {{
      "title": "short issue title",
      "explanation": "simple explanation of the bug",
      "severity": "low|medium|high",
      "fix": "short concrete fix"
    }}
  ]
}}

Rules:
- Focus on bugs, edge cases, and unsafe behavior.
- Explain issues simply.
- If there are no obvious bugs, return an empty issues array.

Code:
{code}
""".strip()

    result = generate_gemini_json(prompt, fallback_payload)
    issues = result.get("issues", [])
    if not isinstance(issues, list):
        issues = []

    normalized_issues = []
    for issue in issues:
        if isinstance(issue, dict):
            severity = str(issue.get("severity", "medium")).lower()
            if severity not in {"low", "medium", "high"}:
                severity = "medium"

            normalized_issues.append(
                {
                    "title": str(issue.get("title", "Issue")),
                    "explanation": str(issue.get("explanation", "No explanation provided.")),
                    "severity": severity,
                    "fix": str(issue.get("fix", "No fix provided.")),
                }
            )

    return {
        "summary": str(result.get("summary", fallback_payload["summary"])),
        "issues": normalized_issues,
    }
