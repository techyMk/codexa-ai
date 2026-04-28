import asyncio
from google import genai
from google.genai import types

from app.config import get_settings
from app.services.ai.base import AIProvider, ReviewResult
from app.services.ai.parser import parse_review
from app.services.ai.prompt import SYSTEM_PROMPT, build_user_prompt


class GeminiProvider(AIProvider):
    name = "gemini-2.0-flash"

    def __init__(self) -> None:
        api_key = get_settings().gemini_api_key
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set")
        self._client = genai.Client(api_key=api_key)

    async def review(
        self, *, title: str, body: str, diff: str, extra_prompt: str = ""
    ) -> ReviewResult:
        prompt = build_user_prompt(title=title, body=body, diff=diff, extra_prompt=extra_prompt)

        response = await asyncio.to_thread(
            self._client.models.generate_content,
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.2,
                max_output_tokens=4096,
            ),
        )
        return parse_review(response.text or "", provider=self.name)
