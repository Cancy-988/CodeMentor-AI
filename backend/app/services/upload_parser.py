from __future__ import annotations

from pathlib import Path


SUPPORTED_EXTENSIONS = {
    ".py": "python",
    ".cpp": "cpp",
    ".java": "java",
    ".js": "javascript",
}


def detect_language_from_filename(filename: str) -> str:
    extension = Path(filename).suffix.lower()
    return SUPPORTED_EXTENSIONS.get(extension, "")


def validate_uploaded_code(filename: str, content: str) -> tuple[str, str]:
    language = detect_language_from_filename(filename)
    if not language:
        raise ValueError("Only .py, .cpp, .java, and .js files are supported.")

    normalized_content = content.strip()
    if not normalized_content:
        raise ValueError("Uploaded file is empty.")

    return language, normalized_content
