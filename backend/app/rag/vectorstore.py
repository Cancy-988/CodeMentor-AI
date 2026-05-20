from functools import lru_cache
from pathlib import Path

from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import settings
from app.rag.documents import build_knowledge_documents


BASE_DIR = Path(__file__).resolve().parents[2]
CHROMA_DIRECTORY = BASE_DIR / "chroma_db"
COLLECTION_NAME = "codementor_knowledge"


@lru_cache(maxsize=1)
def get_vectorstore() -> Chroma:
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.gemini_api_key,
    )

    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=str(CHROMA_DIRECTORY),
        embedding_function=embeddings,
    )

    if vectorstore._collection.count() == 0:
        vectorstore.add_documents(build_knowledge_documents())

    return vectorstore