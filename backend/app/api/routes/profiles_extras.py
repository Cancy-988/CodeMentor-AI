from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.project import ProjectResponse
from app.schemas.memory import MemoryUpsert, MemoryResponse
from app.schemas.fixes import FixSuggestionResponse
from app.services.database import upsert_user, list_projects, get_project, delete_project, set_memory, list_fixes, audit_log

router = APIRouter()


def _resolve_user(db: Session, current_user: AuthUser):
    return upsert_user(
        db,
        supabase_user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        auth_provider="google",
    )


@router.get("/projects", response_model=list[ProjectResponse])
def list_user_projects(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    projects = list_projects(db, user_id=user.id)
    return projects


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_user_project(project_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    project = get_project(db, project_id=project_id)
    if project is None or project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_project(project_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    project = get_project(db, project_id=project_id)
    if project is None or project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    delete_project(db, project_id=project_id)
    audit_log(db, user_id=user.id, action="delete_project", entity_type="project", entity_id=project_id)
    db.commit()
    return None


@router.post("/memories", response_model=MemoryResponse)
def upsert_memory_route(request: MemoryUpsert, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    memory = set_memory(db, user_id=current_user.id, key=request.key, value_json=request.value_json)
    audit_log(db, user_id=current_user.id, action="upsert_memory", entity_type="memory", entity_id=memory.id)
    db.commit()
    return memory


@router.get("/fixes", response_model=list[FixSuggestionResponse])
def list_user_fixes(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    fixes = list_fixes(db, user_id=user.id)
    return fixes


# Chat list endpoint removed — chats feature is no longer part of the product.
