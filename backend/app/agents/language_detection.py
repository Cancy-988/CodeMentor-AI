from typing import Any

from app.services.gemini import generate_gemini_json


def detect_language(code: str, language_hint: str) -> dict[str, Any]:
    fallback_payload = {
        "detected_language": language_hint or "unknown",
        "confidence": "low",
        "explanation": "The backend could not confidently detect the language, so it used the language provided by the user.",
    }

    prompt = f"""
You are the Language Detection Agent for CodeMentor AI.

Look at the code and return ONLY valid JSON with this shape:
{{
  "detected_language": "short language name",
  "confidence": "low|medium|high",
  "explanation": "simple explanation of why you chose that language"
}}

Rules:
- Use the code itself to detect the language.
- Keep the explanation short and beginner friendly.
- If the code is ambiguous, use the user's language hint: {language_hint}

Code:
{code}
""".strip()

    result = generate_gemini_json(prompt, fallback_payload)
    confidence = str(result.get("confidence", fallback_payload["confidence"])).lower()
    if confidence not in {"low", "medium", "high"}:
        confidence = fallback_payload["confidence"]

    return {
        "detected_language": str(result.get("detected_language", fallback_payload["detected_language"])),
        "confidence": confidence,
        "explanation": str(result.get("explanation", fallback_payload["explanation"])),
    }
