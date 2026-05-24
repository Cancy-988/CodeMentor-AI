from typing import Optional
import uuid

from app.core.config import settings

try:
    from supabase import create_client
except Exception:  # pragma: no cover - supabase may not be installed in some envs
    create_client = None


def _get_client():
    if create_client is None:
        return None
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def upload_file_to_bucket(bucket: str, path: Optional[str], file_bytes: bytes, content_type: str) -> Optional[str]:
    """Upload bytes to a Supabase storage bucket.

    Returns the storage path on success, or None on failure / client missing.
    """
    client = _get_client()
    if client is None:
        return None

    # Generate a safe path if not provided
    if not path:
        path = f"uploads/{uuid.uuid4().hex}"

    try:
        # supabase-py v2 storage upload accepts a path and file-like or bytes.
        res = client.storage.from_(bucket).upload(path, file_bytes, {'content-type': content_type})
        # res is usually a dict with 'data' and 'error'
        if isinstance(res, dict):
            if res.get("error"):
                return None
            data = res.get("data") or {}
            return data.get("path") or path

        # Fallback: return provided path
        return path
    except Exception:
        return None
