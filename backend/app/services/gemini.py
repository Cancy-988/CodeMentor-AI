import importlib
import json
from typing import Any

from app.core.config import settings


def _resolve_model_name(genai, preferred_model: str) -> str:
    available_models = []

    try:
        for model in genai.list_models():
            model_name = getattr(model, "name", "")
            supported_methods = getattr(model, "supported_generation_methods", []) or []
            if "generateContent" in supported_methods:
                available_models.append(model_name)
    except Exception:
        return preferred_model

    if preferred_model:
        preferred_full_name = preferred_model if preferred_model.startswith("models/") else f"models/{preferred_model}"
        if preferred_full_name in available_models:
            return preferred_model

    for candidate in (
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ):
        candidate_full_name = candidate if candidate.startswith("models/") else f"models/{candidate}"
        if candidate_full_name in available_models:
            return candidate

    if available_models:
        return available_models[0].removeprefix("models/")

    return preferred_model


def _generate_gemini_text(prompt: str) -> str:
    api_key = settings.gemini_api_key.strip()
    model_name = settings.gemini_model.strip()

    if not api_key:
        return (
            "Gemini is not configured yet. Add GEMINI_API_KEY to backend/.env "
            "to enable AI responses."
        )

    try:
        genai = importlib.import_module("google.generativeai")
    except ImportError:
        return "Install google-generativeai in the backend environment to enable Gemini responses."

    genai.configure(api_key=api_key)
    model_name = _resolve_model_name(genai, model_name)
    model = genai.GenerativeModel(model_name)

    try:
        response = model.generate_content(prompt)
    except Exception as error:
        return (
            f"Gemini request failed for model '{model_name}'. "
            "Open Google AI Studio or list available models for this API key, "
            "then update GEMINI_MODEL in backend/.env."
        )

    return response.text or "Gemini returned an empty response."


def _extract_json_payload(text: str) -> dict[str, Any]:
    cleaned_text = text.strip()

    if cleaned_text.startswith("```"):
        cleaned_text = cleaned_text.strip("`")
        cleaned_text = cleaned_text.removeprefix("json").strip()

    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        start_index = cleaned_text.find("{")
        end_index = cleaned_text.rfind("}")
        if start_index != -1 and end_index != -1 and end_index > start_index:
            return json.loads(cleaned_text[start_index : end_index + 1])
        raise


def generate_gemini_reply(message: str) -> str:
    prompt = (
        "You are CodeMentor AI, a beginner-friendly coding mentor. "
        "Answer the user's question clearly and helpfully.\n\n"
        f"User question: {message}"
    )
    return _generate_gemini_text(prompt)


def generate_code_review(code: str, language: str) -> dict[str, Any]:
    prompt = f"""
You are CodeMentor AI, a beginner-friendly senior code reviewer.

Analyze the code below and return ONLY valid JSON with this exact shape:
{{
  "language": "{language}",
  "summary": "one short simple paragraph",
  "issues": [
    {{
      "title": "short issue title",
      "explanation": "simple explanation of the issue",
      "severity": "low|medium|high",
      "fix": "short concrete fix"
    }}
  ],
  "suggested_fix": "one short overall fix suggestion",
  "improved_code": "optional improved code example or an empty string",
  "next_steps": ["short step 1", "short step 2"]
}}

Rules:
- Explain issues simply.
- Focus on bugs, risks, and practical fixes.
- If you find no issues, return an empty issues array and still explain what is good.
- Do not wrap the JSON in markdown.

Code:
{code}
""".strip()

    raw_response = _generate_gemini_text(prompt)

    try:
        parsed_response = _extract_json_payload(raw_response)
    except json.JSONDecodeError as error:
        return {
            "language": language,
            "summary": "Gemini returned a response, but it was not valid JSON.",
            "issues": [
                {
                    "title": "Invalid model output",
                    "explanation": "The Gemini response was not valid JSON, so the backend could not parse it into structured review data.",
                    "severity": "medium",
                    "fix": "Tighten the prompt or switch to a model that supports more reliable JSON output.",
                }
            ],
            "suggested_fix": "Ask Gemini to return valid JSON only and retry the request.",
            "improved_code": "",
            "next_steps": [
                "Check the model output format",
                "Retry the review after adjusting the prompt",
            ],
        }

    return parsed_response

