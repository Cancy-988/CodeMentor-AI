from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router
from app.api.routes.review import router as review_router


app = FastAPI(title="CodeMentor AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(review_router)


@app.get("/")
def root():
    return {
        "message": "CodeMentor AI backend is running.",
        "docs": "/docs",
        "health": "/api/health"
    }
