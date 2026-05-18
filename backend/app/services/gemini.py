import importlib
import os


def generate_gemini_reply(message: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

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
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(
        f"You are CodeMentor AI, a beginner-friendly coding mentor.\n\nUser question: {message}"
    )
    return response.text or "Gemini returned an empty response."

