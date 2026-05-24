from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router
from app.api.routes.history import router as history_router
from app.api.routes.review import router as review_router
from app.api.routes.upload import router as upload_router
from app.api.routes.projects import router as projects_router
from app.api.routes.fixes import router as fixes_router
from app.api.routes.messages import router as messages_router
from app.api.routes.profiles_extras import router as profiles_extras_router
from app.api.routes.chats_crud import router as chats_crud_router
from app.api.routes.reviews_crud import router as reviews_crud_router
from app.api.routes.uploads_crud import router as uploads_crud_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.db import models as _models


app = FastAPI(title="CodeMentor AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(review_router)
app.include_router(projects_router, prefix="/api")
app.include_router(fixes_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(profiles_extras_router, prefix="/api")
app.include_router(chats_crud_router, prefix="/api")
app.include_router(reviews_crud_router, prefix="/api")
app.include_router(uploads_crud_router, prefix="/api")


@app.on_event("startup")
def create_database_tables() -> None:
    if engine is None:
        return

    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "CodeMentor AI backend is running.",
        "docs": "/docs",
        "health": "/api/health"
    }
