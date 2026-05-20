from langchain_core.documents import Document


def build_knowledge_documents() -> list[Document]:
    return [
        Document(
            page_content=(
                "Write small functions, use clear names, validate inputs early, "
                "and prefer simple logic over clever shortcuts."
            ),
            metadata={"source": "clean_code_guidelines.md", "topic": "clean_code"},
        ),
        Document(
            page_content=(
                "Avoid duplicated logic, keep indentation shallow, and use guard clauses "
                "to handle invalid cases before the main logic runs."
            ),
            metadata={"source": "best_practices.md", "topic": "best_practices"},
        ),
        Document(
            page_content=(
                "For loops and searches, think about time complexity first. "
                "A single pass is usually better than nested loops when possible."
            ),
            metadata={"source": "dsa_notes.md", "topic": "dsa"},
        ),
        Document(
            page_content=(
                "Choose the right data structure for the job. Lists are good for order, "
                "dictionaries are good for lookups, and sets are good for membership checks."
            ),
            metadata={"source": "dsa_notes.md", "topic": "dsa"},
        ),
        Document(
            page_content=(
                "Prefer meaningful error messages, avoid hardcoded magic numbers, and keep "
                "functions focused on one task."
            ),
            metadata={"source": "clean_code_guidelines.md", "topic": "clean_code"},
        ),
        Document(
            page_content=(
                "Check for off-by-one errors, missing returns, empty inputs, and edge cases "
                "before shipping code."
            ),
            metadata={"source": "best_practices.md", "topic": "best_practices"},
        ),
    ]