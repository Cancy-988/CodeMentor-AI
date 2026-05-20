from app.rag.vectorstore import get_vectorstore


def retrieve_relevant_context(code: str, language: str, top_k: int = 3) -> str:
    query = (
        f"Language: {language}\n"
        f"Code:\n{code}\n\n"
        "Find relevant rules about clean code, best practices, DSA, bugs, and performance."
    )

    try:
        vectorstore = get_vectorstore()
        documents = vectorstore.similarity_search(query, k=top_k)
    except Exception:
        return ""

    if not documents:
        return ""

    sections = []
    for index, document in enumerate(documents, start=1):
        source = document.metadata.get("source", "unknown")
        topic = document.metadata.get("topic", "general")
        sections.append(f"{index}. [{topic}] {source}: {document.page_content}")

    return "\n".join(sections)