from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


engine_kwargs = {
    "pool_pre_ping": True,
}


def _create_sqlite_engine():
    fallback_db_path = Path(__file__).resolve().parents[2] / "codementor_ai.sqlite3"
    return create_engine(
        f"sqlite:///{fallback_db_path}",
        connect_args={"check_same_thread": False},
        **engine_kwargs,
    )


def _create_engine():
    if not settings.database_url:
        return _create_sqlite_engine()

    primary_engine = create_engine(settings.database_url, **engine_kwargs)

    try:
        with primary_engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")
    except Exception:
        return _create_sqlite_engine()

    return primary_engine


engine = _create_engine()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()