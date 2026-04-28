import fnmatch
import re
import time
from typing import Any

from app.core.logging import get_logger
from app.db.supabase import get_repo_settings, update_review
from app.services.ai.base import Finding, ReviewResult
from app.services.ai.router import AIRouter
from app.services.github import (
    create_check_run,
    fail_check_run,
    fetch_pr_diff,
    post_pr_comment,
    render_review_comment,
    update_check_run,
)

log = get_logger(__name__)


_router: AIRouter | None = None


def _get_router() -> AIRouter:
    global _router
    if _router is None:
        _router = AIRouter()
    return _router


_SEVERITY_ORDER = {"info": 0, "warn": 1, "error": 2}


def _files_in_diff(diff: str) -> list[str]:
    """Extract file paths from a unified diff (`diff --git a/path b/path` lines)."""
    paths: list[str] = []
    for line in diff.splitlines():
        if line.startswith("diff --git "):
            m = re.match(r"diff --git a/(.+?) b/(.+)", line)
            if m:
                paths.append(m.group(2))
    return paths


def _filter_diff_by_skip_paths(diff: str, skip_paths: list[str]) -> tuple[str, list[str]]:
    """Strip file sections matching any of the glob patterns. Returns (filtered_diff, skipped)."""
    if not skip_paths:
        return diff, []

    skipped: list[str] = []
    sections: list[str] = []
    current: list[str] = []
    current_path: str | None = None

    def _is_skipped(path: str) -> bool:
        return any(fnmatch.fnmatch(path, p) for p in skip_paths)

    for line in diff.splitlines(keepends=True):
        if line.startswith("diff --git "):
            # flush previous section
            if current and current_path is not None and not _is_skipped(current_path):
                sections.append("".join(current))
            elif current_path is not None and _is_skipped(current_path):
                skipped.append(current_path)
            current = [line]
            m = re.match(r"diff --git a/(.+?) b/(.+)", line)
            current_path = m.group(2) if m else None
        else:
            current.append(line)

    # final section
    if current and current_path is not None and not _is_skipped(current_path):
        sections.append("".join(current))
    elif current_path is not None and _is_skipped(current_path):
        skipped.append(current_path)

    return "".join(sections), skipped


def _filter_findings_by_severity(findings: list[Finding], min_severity: str) -> list[Finding]:
    threshold = _SEVERITY_ORDER.get(min_severity, 0)
    return [f for f in findings if _SEVERITY_ORDER.get(f.severity, 0) >= threshold]


def _findings_to_dicts(findings: list[Finding]) -> list[dict[str, Any]]:
    return [f.model_dump() for f in findings]


async def review_pr(
    *,
    review_id: str | None,
    installation_id: int,
    repo: str,
    pr_number: int,
    title: str,
    body: str,
    head_sha: str | None,
) -> None:
    started = time.perf_counter()
    log.info("review_started", repo=repo, pr=pr_number, head_sha=head_sha)

    settings = get_repo_settings(installation_id, repo)

    # Honor per-repo enabled flag — skip review if disabled
    if not settings["enabled"]:
        log.info("review_skipped_disabled", repo=repo, pr=pr_number)
        if review_id:
            update_review(review_id, status="failed", error="disabled by repo settings")
        return

    # Open an in-progress check run so the GitHub UI shows "Codexa AI Review · running"
    check_run_id: int | None = None
    if head_sha:
        check_run_id = await create_check_run(
            installation_id=installation_id, repo=repo, head_sha=head_sha
        )

    # Fetch the PR diff
    try:
        diff = await fetch_pr_diff(
            installation_id=installation_id, repo=repo, pr_number=pr_number
        )
    except Exception as e:
        log.exception("fetch_diff_failed")
        if review_id:
            update_review(review_id, status="failed", error=f"fetch_diff: {e}")
        if check_run_id:
            await fail_check_run(
                installation_id=installation_id,
                repo=repo,
                check_run_id=check_run_id,
                message="Codexa could not fetch the diff for this PR.",
            )
        return

    # Apply per-repo skip globs
    diff, skipped = _filter_diff_by_skip_paths(diff, settings["skip_paths"])
    if skipped:
        log.info("review_skipped_paths", repo=repo, count=len(skipped), paths=skipped[:5])

    if not diff.strip():
        log.info("review_skipped_empty_diff", repo=repo, pr=pr_number)
        if review_id:
            update_review(review_id, status="completed", summary="No reviewable changes.", findings=[], findings_count=0)
        if check_run_id:
            await fail_check_run(
                installation_id=installation_id,
                repo=repo,
                check_run_id=check_run_id,
                message="No reviewable changes after applying skip-path filters.",
            )
        return

    # Run AI review
    extra_prompt = (settings.get("extra_prompt") or "").strip()
    try:
        result = await _get_router().review(
            title=title,
            body=body,
            diff=diff,
            extra_prompt=extra_prompt,
        )
    except Exception as e:
        log.exception("ai_review_failed")
        if review_id:
            update_review(review_id, status="failed", error=str(e))
        if check_run_id:
            await fail_check_run(
                installation_id=installation_id,
                repo=repo,
                check_run_id=check_run_id,
                message=f"AI review failed: {e}",
            )
        return

    # Apply severity threshold
    result.findings = _filter_findings_by_severity(result.findings, settings["min_severity"])

    comment = render_review_comment(result)
    try:
        await post_pr_comment(
            installation_id=installation_id,
            repo=repo,
            pr_number=pr_number,
            body=comment,
        )
    except Exception as e:
        log.exception("post_comment_failed")
        if review_id:
            update_review(
                review_id,
                provider=result.provider,
                status="failed",
                summary=result.summary,
                findings=_findings_to_dicts(result.findings),
                findings_count=len(result.findings),
                error=f"post_comment: {e}",
            )
        if check_run_id:
            await fail_check_run(
                installation_id=installation_id,
                repo=repo,
                check_run_id=check_run_id,
                message="AI review succeeded but the comment failed to post.",
            )
        return

    # Finalize the check run with success/failure based on findings severity
    if check_run_id:
        await update_check_run(
            installation_id=installation_id,
            repo=repo,
            check_run_id=check_run_id,
            result=result,
        )

    duration_ms = int((time.perf_counter() - started) * 1000)
    if review_id:
        update_review(
            review_id,
            provider=result.provider,
            status="completed",
            summary=result.summary,
            findings=_findings_to_dicts(result.findings),
            findings_count=len(result.findings),
            duration_ms=duration_ms,
        )
    log.info(
        "review_completed",
        repo=repo,
        pr=pr_number,
        provider=result.provider,
        findings=len(result.findings),
        max_severity=result.max_severity,
        duration_ms=duration_ms,
    )
