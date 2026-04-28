import json
import re

from pydantic import ValidationError

from app.core.logging import get_logger
from app.services.ai.base import ReviewResult

log = get_logger(__name__)

_JSON_BLOCK = re.compile(r"\{[\s\S]*\}")


def parse_review(raw: str, *, provider: str) -> ReviewResult:
    """Best-effort parse of model output into a validated ReviewResult.

    Models occasionally wrap JSON in ```json fences or add trailing prose,
    so we extract the first {...} block before json.loads, then run it
    through Pydantic for type/range validation.
    """
    text = (raw or "").strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:].lstrip()

    match = _JSON_BLOCK.search(text)
    if not match:
        log.warning("ai_response_no_json", provider=provider, raw_len=len(raw or ""))
        return ReviewResult(
            summary="Codexa could not parse the model response.",
            findings=[],
            provider=provider,
        )

    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError as e:
        log.warning("ai_response_invalid_json", provider=provider, error=str(e))
        return ReviewResult(
            summary="Codexa received malformed JSON from the model.",
            findings=[],
            provider=provider,
        )

    if not isinstance(data, dict):
        log.warning("ai_response_not_object", provider=provider, type=type(data).__name__)
        return ReviewResult(
            summary="Codexa received an unexpected response shape.",
            findings=[],
            provider=provider,
        )

    data["provider"] = provider
    if "findings" not in data or not isinstance(data["findings"], list):
        data["findings"] = []
    if "summary" not in data:
        data["summary"] = "No summary provided."

    try:
        return ReviewResult.model_validate(data)
    except ValidationError as e:
        log.warning("ai_response_validation_failed", provider=provider, errors=str(e))
        # Return whatever we can salvage rather than failing the whole review
        return ReviewResult(
            summary=str(data.get("summary", "")).strip() or "Validation error in AI response.",
            findings=[],
            provider=provider,
        )
