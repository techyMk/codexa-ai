from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request

from app.core.logging import get_logger
from app.core.security import verify_webhook_signature
from app.db.supabase import insert_pending_review
from app.services.reviewer import review_pr

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
log = get_logger(__name__)


_REVIEWABLE_ACTIONS = {"opened", "reopened", "synchronize", "ready_for_review"}


@router.post("/github")
async def github_webhook(
    request: Request,
    background: BackgroundTasks,
    x_github_event: str | None = Header(default=None),
    x_hub_signature_256: str | None = Header(default=None),
):
    raw = await request.body()

    if not verify_webhook_signature(raw, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="invalid signature")

    payload = await request.json()
    event = x_github_event or ""

    if event == "ping":
        return {"ok": True, "pong": True}

    if event != "pull_request":
        return {"ok": True, "ignored": event}

    action = payload.get("action")
    pr = payload.get("pull_request") or {}
    if action not in _REVIEWABLE_ACTIONS or pr.get("draft"):
        return {"ok": True, "skipped": action}

    repo_full = (payload.get("repository") or {}).get("full_name")
    installation_id = (payload.get("installation") or {}).get("id")
    pr_number = pr.get("number")
    head_sha = (pr.get("head") or {}).get("sha")
    pr_url = pr.get("html_url")
    pr_title = pr.get("title", "")

    if not (repo_full and installation_id and pr_number):
        log.warning("webhook_missing_fields", payload_keys=list(payload.keys()))
        raise HTTPException(status_code=400, detail="missing required fields")

    # Insert a pending row immediately so the dashboard shows activity right away.
    review_id = insert_pending_review(
        repo=repo_full,
        pr_number=pr_number,
        installation_id=installation_id,
        pr_title=pr_title,
        pr_url=pr_url,
    )

    background.add_task(
        review_pr,
        review_id=review_id,
        installation_id=installation_id,
        repo=repo_full,
        pr_number=pr_number,
        title=pr_title,
        body=pr.get("body") or "",
        head_sha=head_sha,
    )

    return {"ok": True, "queued": True, "review_id": review_id}
