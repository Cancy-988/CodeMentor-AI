import os

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


if load_dotenv is not None:
    load_dotenv()


class Settings:
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    database_url = os.getenv("DATABASE_URL", "")
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    @property
    def cors_origins(self):
        raw_origins = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


settings = Settings()
