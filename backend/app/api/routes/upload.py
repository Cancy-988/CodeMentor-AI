from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import get_optional_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.upload import CodeUploadResponse
from app.services.database import create_chat, save_upload, upsert_user
from app.services.upload_parser import validate_uploaded_code
from app.services import vision
from app.services import supabase_storage
import uuid

router = APIRouter()


@router.post("/upload-code", response_model=CodeUploadResponse)
async def upload_code(file: UploadFile = File(...), current_user: AuthUser | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    try:
        raw_content = await file.read()
        content = raw_content.decode("utf-8")
        language, normalized_content = validate_uploaded_code(file.filename or "", content)

        if current_user is not None:
            user = upsert_user(
                db,
                supabase_user_id=current_user.id,
                email=current_user.email,
                full_name=None,
                avatar_url=None,
                auth_provider="google",
            )
            chat = create_chat(
                db,
                user_id=user.id,
                title=file.filename or "Uploaded code",
                summary=f"Uploaded {language} file",
                language=language,
                source="upload",
            )
            save_upload(
                db,
                user_id=user.id,
                chat_id=chat.id,
                filename=file.filename or "uploaded-code",
                language=language,
                content=normalized_content,
                mime_type=file.content_type,
            )
            db.commit()

        return CodeUploadResponse(
            filename=file.filename or "uploaded-code",
            language=language,
            content=normalized_content,
        )
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail="Uploaded file must be UTF-8 text.") from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to read the uploaded file.") from error


@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...), current_user: AuthUser | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    """Generic upload endpoint that accepts code or image files.
    - Code files: validated and returned similar to /upload-code
    - Image files: OCR extracted (pytesseract or Gemini Vision) and saved to uploads.extracted_text
    """
    try:
        # Image handling
        content_type = (file.content_type or "").lower()
        raw = await file.read()

        if content_type.startswith("image/"):
            extracted_text, meta = vision.extract_text_from_image_bytes(raw)

            if current_user is not None:
                user = upsert_user(
                    db,
                    supabase_user_id=current_user.id,
                    email=current_user.email,
                    full_name=None,
                    avatar_url=None,
                    auth_provider="google",
                )
                chat = create_chat(
                    db,
                    user_id=user.id,
                    title=file.filename or "Uploaded image",
                    summary=f"Uploaded image {file.filename}",
                    language=None,
                    source="upload",
                )
                # Attempt to persist the raw file to Supabase storage (bucket: 'uploads')
                storage_path = None
                try:
                    bucket = "uploads"
                    filename = file.filename or "uploaded-image"
                    key = f"{user.id}/{uuid.uuid4().hex}_{filename}"
                    storage_path = supabase_storage.upload_file_to_bucket(bucket, key, raw, file.content_type or "application/octet-stream")
                except Exception:
                    storage_path = None

                save_upload(
                    db,
                    user_id=user.id,
                    chat_id=chat.id,
                    filename=file.filename or "uploaded-image",
                    language="",
                    content="",
                    file_type="image",
                    mime_type=file.content_type,
                    storage_path=storage_path,
                    extracted_text=extracted_text,
                )
                db.commit()

            return {"filename": file.filename or "uploaded-image", "file_type": "image", "mime_type": file.content_type, "extracted_text": extracted_text, "meta": meta}

        # Fallback: treat as code file
        content = raw.decode("utf-8")
        language, normalized_content = validate_uploaded_code(file.filename or "", content)

        if current_user is not None:
            user = upsert_user(
                db,
                supabase_user_id=current_user.id,
                email=current_user.email,
                full_name=None,
                avatar_url=None,
                auth_provider="google",
            )
            chat = create_chat(
                db,
                user_id=user.id,
                title=file.filename or "Uploaded code",
                summary=f"Uploaded {language} file",
                language=language,
                source="upload",
            )
            # Persist original file to Supabase storage for safekeeping
            storage_path = None
            try:
                bucket = "uploads"
                filename = file.filename or "uploaded-code"
                key = f"{user.id}/{uuid.uuid4().hex}_{filename}"
                storage_path = supabase_storage.upload_file_to_bucket(bucket, key, raw, file.content_type or "text/plain")
            except Exception:
                storage_path = None

            save_upload(
                db,
                user_id=user.id,
                chat_id=chat.id,
                filename=file.filename or "uploaded-code",
                language=language,
                content=normalized_content,
                file_type="code",
                mime_type=file.content_type,
                storage_path=storage_path,
            )
            db.commit()

        return {"filename": file.filename or "uploaded-code", "language": language, "content": normalized_content}
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail="Uploaded file must be UTF-8 text.") from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to read the uploaded file.") from error
