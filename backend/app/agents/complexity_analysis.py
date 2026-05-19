from typing import Any

from app.services.gemini import generate_gemini_json


def analyze_complexity(code: str, language: str) -> dict[str, Any]:
    fallback_payload = {
        "time_complexity": "Unknown",
        "space_complexity": "Unknown",
        "explanation": "A simple complexity analysis could not be generated.",
    }

    prompt = f"""
You are the Complexity Analysis Agent for CodeMentor AI.

Analyze the {language} code and return ONLY valid JSON with this shape:
{{
  "time_complexity": "for example O(n)",
  "space_complexity": "for example O(1)",
  "explanation": "simple explanation of why"
}}

Rules:
- Keep the explanation simple.
- If the exact complexity is unclear, give the most likely answer and explain the assumption.

Code:
{code}
""".strip()

    result = generate_gemini_json(prompt, fallback_payload)
    return {
        "time_complexity": str(result.get("time_complexity", fallback_payload["time_complexity"])),
        "space_complexity": str(result.get("space_complexity", fallback_payload["space_complexity"])),
        "explanation": str(result.get("explanation", fallback_payload["explanation"])),
    }
