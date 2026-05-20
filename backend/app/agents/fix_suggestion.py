from typing import Any

from app.services.gemini import generate_gemini_json


def suggest_fixes(code: str, language: str, bug_summary: str, retrieved_context: str = "") -> dict[str, Any]:
    fallback_payload = {
        "recommended_fix": "Review the issues found by the bug detection agent and apply the smallest safe fix first.",
        "alternatives": [],
        "improved_code": "",
    }

    prompt = f"""
You are the Fix Suggestion Agent for CodeMentor AI.

Suggest the best fixes for this {language} code and return ONLY valid JSON with this shape:
{{
  "recommended_fix": "one clear best fix",
  "alternatives": ["short alternative fix 1", "short alternative fix 2"],
  "improved_code": "optional improved code example or an empty string"
}}

Context from bug detection:
{bug_summary}

Rules:
- Prefer simple and practical fixes.
- Keep the explanation beginner friendly.
- If no fix is needed, explain what is already good.

Relevant retrieved rules and notes:
{retrieved_context or "No extra rules were retrieved."}

Code:
{code}
""".strip()

    result = generate_gemini_json(prompt, fallback_payload)
    alternatives = result.get("alternatives", [])
    if not isinstance(alternatives, list):
        alternatives = []

    return {
        "recommended_fix": str(result.get("recommended_fix", fallback_payload["recommended_fix"])),
        "alternatives": [str(item) for item in alternatives if isinstance(item, (str, int, float))],
        "improved_code": str(result.get("improved_code", fallback_payload["improved_code"])),
    }
