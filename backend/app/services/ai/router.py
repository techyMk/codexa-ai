from app.config import get_settings
from app.core.logging import get_logger
from app.services.ai.base import AIProvider, ReviewResult
from app.services.ai.gemini import GeminiProvider
from app.services.ai.groq import GroqProvider

log = get_logger(__name__)


class AIRouter:
    """Try providers in order, fall back on failure.

    Order: Gemini (better at code reasoning, generous free quota) → Groq (very fast).
    """

    def __init__(self) -> None:
        self._providers: list[AIProvider] = []
        settings = get_settings()
        if settings.gemini_api_key:
            try:
                self._providers.append(GeminiProvider())
            except Exception as e:
                log.warning("gemini_init_failed", error=str(e))
        if settings.groq_api_key:
            try:
                self._providers.append(GroqProvider())
            except Exception as e:
                log.warning("groq_init_failed", error=str(e))

        if not self._providers:
            raise RuntimeError(
                "No AI providers configured. Set GEMINI_API_KEY or GROQ_API_KEY."
            )

    async def review(
        self,
        *,
        title: str,
        body: str,
        diff: str,
        extra_prompt: str = "",
    ) -> ReviewResult:
        last_error: Exception | None = None
        for provider in self._providers:
            try:
                log.info("ai_review_attempt", provider=provider.name)
                return await provider.review(
                    title=title, body=body, diff=diff, extra_prompt=extra_prompt
                )
            except Exception as e:
                last_error = e
                log.warning("ai_review_failed", provider=provider.name, error=str(e))
                continue
        raise RuntimeError(f"All AI providers failed: {last_error}")
