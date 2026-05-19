from typing import Any

from app.services.gemini import generate_gemini_json


def explain_issues(code: str, language: str, bug_summary: str, fix_summary: str) -> dict[str, Any]:
    fallback_payload = {
        "simple_explanation": "The code was reviewed, but the explanation could not be generated safely.",
        "key_takeaways": [],
    }

    prompt = f"""
You are the Explanation Agent for CodeMentor AI.

Explain the code and review results in very simple language.
Return ONLY valid JSON with this shape:
{{
  "simple_explanation": "one short beginner friendly paragraph",
  "key_takeaways": ["short takeaway 1", "short takeaway 2"]
}}

Context:
- Language: {language}
- Bug summary: {bug_summary}
- Fix summary: {fix_summary}

Rules:
- Avoid jargon where possible.
- Make it easy for a beginner to understand.

Code:
{code}
""".strip()

    result = generate_gemini_json(prompt, fallback_payload)
    key_takeaways = result.get("key_takeaways", [])
    if not isinstance(key_takeaways, list):
        key_takeaways = []

    return {
        "simple_explanation": str(result.get("simple_explanation", fallback_payload["simple_explanation"])),
        "key_takeaways": [str(item) for item in key_takeaways if isinstance(item, (str, int, float))],
    }
