from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import supabase

router = APIRouter(prefix="/settings", tags=["settings"])


class RepoSettings(BaseModel):
    skip_paths: list[str] = Field(default_factory=list, max_length=50)
    min_severity: Literal["info", "warn", "error"] = "info"
    extra_prompt: str = Field(default="", max_length=4000)
    enabled: bool = True

    @field_validator("skip_paths")
    @classmethod
    def _trim_skip_paths(cls, v: list[str]) -> list[str]:
        return [p.strip() for p in v if p and p.strip()][:50]


@router.get("/repos/{owner}/{repo}")
async def get_repo_settings_route(
    owner: str,
    repo: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    if not current_user.github_login or owner.lower() != current_user.github_login.lower():
        raise HTTPException(status_code=403, detail="forbidden")

    repo_full = f"{owner}/{repo}"

    try:
        # First find the user's installation_id for this repo (via reviews table)
        rev = (
            supabase()
            .table("reviews")
            .select("installation_id")
            .eq("repo", repo_full)
            .limit(1)
            .execute()
        )
        if not rev.data:
            return RepoSettings().model_dump()

        installation_id = rev.data[0]["installation_id"]

        result = (
            supabase()
            .table("repo_settings")
            .select("*")
            .eq("installation_id", installation_id)
            .eq("repo", repo_full)
            .limit(1)
            .execute()
        )
        if result.data:
            row = result.data[0]
            return RepoSettings(
                skip_paths=row.get("skip_paths") or [],
                min_severity=row.get("min_severity") or "info",
                extra_prompt=row.get("extra_prompt") or "",
                enabled=bool(row.get("enabled", True)),
            ).model_dump()
        return RepoSettings().model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/repos/{owner}/{repo}")
async def update_repo_settings(
    owner: str,
    repo: str,
    payload: RepoSettings,
    current_user: CurrentUser = Depends(get_current_user),
):
    if not current_user.github_login or owner.lower() != current_user.github_login.lower():
        raise HTTPException(status_code=403, detail="forbidden")

    repo_full = f"{owner}/{repo}"

    try:
        rev = (
            supabase()
            .table("reviews")
            .select("installation_id")
            .eq("repo", repo_full)
            .limit(1)
            .execute()
        )
        if not rev.data:
            raise HTTPException(
                status_code=404,
                detail="No reviews found for this repo. Open a PR first so Codexa knows the installation.",
            )
        installation_id = rev.data[0]["installation_id"]

        supabase().table("repo_settings").upsert(
            {
                "installation_id": installation_id,
                "repo": repo_full,
                "skip_paths": payload.skip_paths,
                "min_severity": payload.min_severity,
                "extra_prompt": payload.extra_prompt,
                "enabled": payload.enabled,
            }
        ).execute()
        return payload.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
