from groq import AsyncGroq

from app.config import get_settings
from app.services.ai.base import AIProvider, ReviewResult
from app.services.ai.parser import parse_review
from app.services.ai.prompt import SYSTEM_PROMPT, build_user_prompt


class GroqProvider(AIProvider):
    name = "groq-llama-3.3-70b"

    def __init__(self) -> None:
        api_key = get_settings().groq_api_key
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        self._client = AsyncGroq(api_key=api_key)

    async def review(
        self, *, title: str, body: str, diff: str, extra_prompt: str = ""
    ) -> ReviewResult:
        completion = await self._client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_user_prompt(
                        title=title, body=body, diff=diff, extra_prompt=extra_prompt
                    ),
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=4096,
        )
        raw = completion.choices[0].message.content or ""
        return parse_review(raw, provider=self.name)
