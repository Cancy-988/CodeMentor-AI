from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.models import ChatMessage, ChatThread, CodeReviewRecord, MemoryRecord, UploadRecord, UserAccount


def upsert_user(db: Session, *, supabase_user_id: str, email: str | None, full_name: str | None, avatar_url: str | None, auth_provider: str = "google") -> UserAccount:
    user = db.query(UserAccount).filter(UserAccount.supabase_user_id == supabase_user_id).one_or_none()

    if user is None:
        user = UserAccount(
            supabase_user_id=supabase_user_id,
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            auth_provider=auth_provider,
        )
        db.add(user)
        db.flush()
        return user

    user.email = email
    user.full_name = full_name
    user.avatar_url = avatar_url
    user.auth_provider = auth_provider
    db.flush()
    return user


def create_chat(db: Session, *, user_id: int, title: str, summary: str | None = None, language: str | None = None, framework: str | None = None, source: str = "chat") -> ChatThread:
    chat = ChatThread(
        user_id=user_id,
        title=title,
        summary=summary,
        language=language,
        framework=framework,
        source=source,
    )
    db.add(chat)
    db.flush()
    return chat


def add_chat_message(db: Session, *, chat_id: int, role: str, content: str, metadata_json: dict | None = None) -> ChatMessage:
    message = ChatMessage(chat_id=chat_id, role=role, content=content, metadata_json=metadata_json)
    db.add(message)
    db.flush()
    return message


def save_review(db: Session, *, user_id: int, language: str, code: str, result_json: dict, chat_id: int | None = None) -> CodeReviewRecord:
    review = CodeReviewRecord(user_id=user_id, chat_id=chat_id, language=language, code=code, result_json=result_json)
    db.add(review)
    db.flush()
    return review


def save_upload(db: Session, *, user_id: int, filename: str, language: str, content: str, chat_id: int | None = None, file_type: str = "code", mime_type: str | None = None, storage_path: str | None = None, extracted_text: str | None = None) -> UploadRecord:
    upload = UploadRecord(
        user_id=user_id,
        chat_id=chat_id,
        filename=filename,
        language=language,
        content=content,
        file_type=file_type,
        mime_type=mime_type,
        storage_path=storage_path,
        extracted_text=extracted_text,
    )
    db.add(upload)
    db.flush()
    return upload


def set_memory(db: Session, *, user_id: int, key: str, value_json: dict) -> MemoryRecord:
    memory = db.query(MemoryRecord).filter(MemoryRecord.user_id == user_id, MemoryRecord.key == key).one_or_none()

    if memory is None:
        memory = MemoryRecord(user_id=user_id, key=key, value_json=value_json)
        db.add(memory)
        db.flush()
        return memory

    memory.value_json = value_json
    db.flush()
    return memory


def get_memory(db: Session, *, user_id: int, key: str):
    return db.query(MemoryRecord).filter(MemoryRecord.user_id == user_id, MemoryRecord.key == key).one_or_none()


def create_project(db: Session, *, user_id: int, name: str, description: str | None = None, language: str | None = None, framework: str | None = None, status: str | None = None):
    from app.db.models import Project

    project = Project(user_id=user_id, name=name, description=description, language=language, framework=framework, status=status)
    db.add(project)
    db.flush()
    return project


def update_project(db: Session, *, project_id: int, **patch):
    from app.db.models import Project

    project = db.query(Project).filter(Project.id == project_id).one_or_none()
    if project is None:
        return None

    for key, value in patch.items():
        if hasattr(project, key) and value is not None:
            setattr(project, key, value)

    db.flush()
    return project


def create_fix(db: Session, *, user_id: int, original_code: str, fixed_code: str, explanation: str | None = None, chat_id: int | None = None, review_id: int | None = None, validation_json: dict | None = None):
    from app.db.models import FixRecord

    fix = FixRecord(
        user_id=user_id,
        chat_id=chat_id,
        review_id=review_id,
        original_code=original_code,
        fixed_code=fixed_code,
        explanation=explanation,
        validation_json=validation_json,
    )
    db.add(fix)
    db.flush()
    return fix


def list_projects(db: Session, *, user_id: int):
    from app.db.models import Project

    return db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()


def get_project(db: Session, *, project_id: int):
    from app.db.models import Project

    return db.query(Project).filter(Project.id == project_id).one_or_none()


def delete_project(db: Session, *, project_id: int):
    project = db.query(getattr(__import__('app.db.models', fromlist=['Project']), 'Project')).filter(
        getattr(__import__('app.db.models', fromlist=['Project']), 'Project').id == project_id
    ).one_or_none()
    if project is None:
        return False
    db.delete(project)
    db.flush()
    return True


def save_project_workspace(db: Session, *, user_id: int, project_id: int, workspace_json: dict):
    key = f"project_workspace:{project_id}"
    return set_memory(db, user_id=user_id, key=key, value_json=workspace_json)


def get_project_workspace(db: Session, *, user_id: int, project_id: int):
    key = f"project_workspace:{project_id}"
    return get_memory(db, user_id=user_id, key=key)


def list_fixes(db: Session, *, user_id: int):
    from app.db.models import FixRecord

    return db.query(FixRecord).filter(FixRecord.user_id == user_id).order_by(FixRecord.created_at.desc()).all()


def list_messages(db: Session, *, chat_id: int):
    from app.db.models import ChatMessage

    return db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at.asc()).all()


def audit_log(db: Session, *, user_id: int | None, action: str, entity_type: str | None = None, entity_id: int | None = None, metadata: dict | None = None):
    from app.db.models import AuditLog

    log = AuditLog(user_id=user_id, action=action, entity_type=entity_type, entity_id=entity_id, metadata_json=metadata)
    db.add(log)
    db.flush()
    return log


def get_chat(db: Session, *, chat_id: int):
    from app.db.models import ChatThread

    return db.query(ChatThread).filter(ChatThread.id == chat_id).one_or_none()


def update_chat(db: Session, *, chat_id: int, **patch):
    chat = db.query(getattr(__import__('app.db.models', fromlist=['ChatThread']), 'ChatThread')).filter(
        getattr(__import__('app.db.models', fromlist=['ChatThread']), 'ChatThread').id == chat_id
    ).one_or_none()
    if chat is None:
        return None

    for key, value in patch.items():
        if hasattr(chat, key) and value is not None:
            setattr(chat, key, value)

    db.flush()
    return chat


def delete_chat(db: Session, *, chat_id: int):
    chat = db.query(getattr(__import__('app.db.models', fromlist=['ChatThread']), 'ChatThread')).filter(
        getattr(__import__('app.db.models', fromlist=['ChatThread']), 'ChatThread').id == chat_id
    ).one_or_none()
    if chat is None:
        return False
    db.delete(chat)
    db.flush()
    return True


def get_review(db: Session, *, review_id: int):
    from app.db.models import CodeReviewRecord

    return db.query(CodeReviewRecord).filter(CodeReviewRecord.id == review_id).one_or_none()


def list_reviews(db: Session, *, user_id: int | None = None, chat_id: int | None = None):
    from app.db.models import CodeReviewRecord

    q = db.query(CodeReviewRecord)
    if user_id is not None:
        q = q.filter(CodeReviewRecord.user_id == user_id)
    if chat_id is not None:
        q = q.filter(CodeReviewRecord.chat_id == chat_id)
    return q.order_by(CodeReviewRecord.created_at.desc()).all()


def list_chats(db: Session, *, user_id: int | None = None):
    from app.db.models import ChatThread

    q = db.query(ChatThread)
    if user_id is not None:
        q = q.filter(ChatThread.user_id == user_id)
    return q.order_by(ChatThread.updated_at.desc()).all()


def get_upload(db: Session, *, upload_id: int):
    from app.db.models import UploadRecord

    return db.query(UploadRecord).filter(UploadRecord.id == upload_id).one_or_none()


def list_uploads(db: Session, *, user_id: int | None = None, chat_id: int | None = None):
    from app.db.models import UploadRecord

    q = db.query(UploadRecord)
    if user_id is not None:
        q = q.filter(UploadRecord.user_id == user_id)
    if chat_id is not None:
        q = q.filter(UploadRecord.chat_id == chat_id)
    return q.order_by(UploadRecord.created_at.desc()).all()
