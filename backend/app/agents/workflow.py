from app.agents.bug_detection import detect_bugs
from app.agents.complexity_analysis import analyze_complexity
from app.agents.explanation import explain_issues
from app.agents.fix_suggestion import suggest_fixes
from app.agents.language_detection import detect_language


def run_review_workflow(code: str, language: str) -> dict:
    language_detection = detect_language(code, language)
    detected_language = language_detection.get("detected_language", language) or language

    bug_detection = detect_bugs(code, detected_language)
    fix_suggestion = suggest_fixes(code, detected_language, bug_detection.get("summary", ""))
    complexity_analysis = analyze_complexity(code, detected_language)
    explanation = explain_issues(
        code,
        detected_language,
        bug_detection.get("summary", ""),
        fix_suggestion.get("recommended_fix", ""),
    )

    return {
        "input_language": language,
        "language_detection": language_detection,
        "bug_detection": bug_detection,
        "fix_suggestion": fix_suggestion,
        "complexity_analysis": complexity_analysis,
        "explanation": explanation,
        "final_summary": (
            f"Detected {detected_language}. {bug_detection.get('summary', '')} "
            f"Recommended fix: {fix_suggestion.get('recommended_fix', '')}"
        ).strip(),
        "next_steps": [
            "Fix the highest severity issues first",
            "Run the code again after each change",
            "Test edge cases after applying the fix",
        ],
    }
