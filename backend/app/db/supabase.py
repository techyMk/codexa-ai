from functools import lru_cache
from typing import Any
from uuid import UUID

from supabase import create_client, Client

from app.config import get_settings
from app.core.logging import get_logger

log = get_logger(__name__)


@lru_cache
def supabase() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def insert_pending_review(
    *,
    repo: str,
    pr_number: int,
    installation_id: int,
    pr_title: str | None = None,
    pr_url: str | None = None,
) -> str | None:
    """Create a `pending` row at webhook time so the dashboard shows activity immediately.

    Returns the row's UUID (so we can update it later), or None on failure.
    """
    try:
        result = (
            supabase()
            .table("reviews")
            .insert(
                {
                    "repo": repo,
                    "pr_number": pr_number,
                    "installation_id": installation_id,
                    "provider": "-",
                    "status": "pending",
                    "pr_title": pr_title,
                    "pr_url": pr_url,
                }
            )
            .execute()
        )
        if result.data:
            return str(result.data[0]["id"])
    except Exception:
        log.exception("supabase_pending_insert_failed")
    return None


def update_review(
    review_id: str,
    *,
    provider: str | None = None,
    status: str | None = None,
    summary: str | None = None,
    findings: list[dict[str, Any]] | None = None,
    findings_count: int | None = None,
    duration_ms: int | None = None,
    error: str | None = None,
) -> None:
    """Update an existing review row by id."""
    payload: dict[str, Any] = {}
    if provider is not None:
        payload["provider"] = provider
    if status is not None:
        payload["status"] = status
    if summary is not None:
        payload["summary"] = summary
    if findings is not None:
        payload["findings"] = findings
    if findings_count is not None:
        payload["findings_count"] = findings_count
    if duration_ms is not None:
        payload["duration_ms"] = duration_ms
    if error is not None:
        payload["error"] = error

    if not payload:
        return

    try:
        supabase().table("reviews").update(payload).eq("id", review_id).execute()
    except Exception:
        log.exception("supabase_update_failed", review_id=review_id)


def get_repo_settings(installation_id: int, repo: str) -> dict[str, Any]:
    """Per-repo settings, with sensible defaults when none exist."""
    defaults = {
        "skip_paths": [],
        "min_severity": "info",
        "extra_prompt": "",
        "enabled": True,
    }
    try:
        result = (
            supabase()
            .table("repo_settings")
            .select("*")
            .eq("installation_id", installation_id)
            .eq("repo", repo)
            .limit(1)
            .execute()
        )
        if result.data:
            row = result.data[0]
            return {
                "skip_paths": row.get("skip_paths") or [],
                "min_severity": row.get("min_severity") or "info",
                "extra_prompt": row.get("extra_prompt") or "",
                "enabled": bool(row.get("enabled", True)),
            }
    except Exception:
        log.exception("supabase_settings_fetch_failed")
    return defaults
