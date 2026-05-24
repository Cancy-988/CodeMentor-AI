from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectWorkspaceResponse, ProjectWorkspaceUpsert
from app.services.database import upsert_user, create_project, update_project, get_project, save_project_workspace, get_project_workspace

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


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project_route(request: ProjectCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    project = create_project(db, user_id=user.id, name=request.name, description=request.description, language=request.language, framework=request.framework)
    db.commit()
    return project


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
def update_project_route(project_id: int, request: ProjectUpdate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    project = get_project(db, project_id=project_id)
    if project is None or project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project = update_project(db, project_id=project_id, **request.model_dump(exclude_none=True))
    db.commit()
    return project


@router.get("/projects/{project_id}/workspace", response_model=ProjectWorkspaceResponse)
def get_project_workspace_route(project_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    project = get_project(db, project_id=project_id)
    if project is None or project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    workspace = get_project_workspace(db, user_id=user.id, project_id=project_id)
    return {
        "project": project,
        "workspace_json": workspace.value_json if workspace is not None else None,
    }


@router.put("/projects/{project_id}/workspace", response_model=ProjectWorkspaceResponse)
def save_project_workspace_route(project_id: int, request: ProjectWorkspaceUpsert, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    project = get_project(db, project_id=project_id)
    if project is None or project.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    workspace = save_project_workspace(db, user_id=user.id, project_id=project_id, workspace_json=request.workspace_json)
    db.commit()
    return {
        "project": project,
        "workspace_json": workspace.value_json,
    }
