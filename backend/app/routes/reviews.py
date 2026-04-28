from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import CurrentUser, get_current_user
from app.db.supabase import supabase

router = APIRouter(prefix="/reviews", tags=["reviews"])


_EMPTY_STATS = {
    "total_reviews": 0,
    "completed_reviews": 0,
    "findings": 0,
    "avg_duration_ms": 0,
}


@router.get("")
async def list_reviews(
    current_user: CurrentUser = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=200),
    repo: str | None = None,
    status: Literal["pending", "completed", "failed"] | None = None,
):
    """Recent reviews scoped to the signed-in user, with optional filters."""
    if not current_user.github_login:
        return {"reviews": []}

    try:
        q = (
            supabase()
            .table("reviews")
            .select("id,repo,pr_number,pr_url,pr_title,provider,status,summary,findings_count,duration_ms,created_at")
            .like("repo", f"{current_user.github_login}/%")
            .order("created_at", desc=True)
            .limit(limit)
        )
        if repo:
            q = q.eq("repo", repo)
        if status:
            q = q.eq("status", status)
        result = q.execute()
        return {"reviews": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repos")
async def list_user_repos(current_user: CurrentUser = Depends(get_current_user)):
    """Distinct repo names the user has any review for. Used to populate the filter dropdown."""
    if not current_user.github_login:
        return {"repos": []}

    try:
        rows = (
            supabase()
            .table("reviews")
            .select("repo")
            .like("repo", f"{current_user.github_login}/%")
            .execute()
            .data
        )
        repos = sorted({r["repo"] for r in rows if r.get("repo")})
        return {"repos": repos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def stats(current_user: CurrentUser = Depends(get_current_user)):
    if not current_user.github_login:
        return _EMPTY_STATS

    try:
        rows = (
            supabase()
            .table("reviews")
            .select("status,findings_count,duration_ms")
            .like("repo", f"{current_user.github_login}/%")
            .execute()
            .data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    total = len(rows)
    completed = sum(1 for r in rows if r.get("status") == "completed")
    findings = sum((r.get("findings_count") or 0) for r in rows)
    durations = [r["duration_ms"] for r in rows if r.get("duration_ms")]
    avg_ms = int(sum(durations) / len(durations)) if durations else 0
    return {
        "total_reviews": total,
        "completed_reviews": completed,
        "findings": findings,
        "avg_duration_ms": avg_ms,
    }


@router.get("/{review_id}")
async def get_review(
    review_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Full review record including findings JSON. Owner-scoped."""
    if not current_user.github_login:
        raise HTTPException(status_code=404, detail="not found")

    try:
        result = (
            supabase()
            .table("reviews")
            .select("*")
            .eq("id", review_id)
            .like("repo", f"{current_user.github_login}/%")
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not result.data:
        raise HTTPException(status_code=404, detail="not found")
    return result.data[0]
