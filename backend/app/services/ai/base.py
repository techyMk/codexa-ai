from abc import ABC, abstractmethod
from typing import Literal

from pydantic import BaseModel, Field, field_validator


Severity = Literal["info", "warn", "error"]


class Finding(BaseModel):
    """A single issue surfaced by the AI review."""

    file: str = ""
    line: int | None = None
    severity: Severity = "info"
    message: str = ""
    suggestion: str | None = None

    @field_validator("severity", mode="before")
    @classmethod
    def _normalize_severity(cls, v: object) -> str:
        if not isinstance(v, str):
            return "info"
        v = v.lower().strip()
        if v in {"critical", "high", "blocker"}:
            return "error"
        if v in {"medium", "moderate", "low"}:
            return "warn"
        if v in {"info", "warn", "error"}:
            return v
        return "info"

    @field_validator("message", mode="before")
    @classmethod
    def _coerce_message(cls, v: object) -> str:
        return str(v).strip() if v is not None else ""

    @field_validator("suggestion", mode="before")
    @classmethod
    def _coerce_suggestion(cls, v: object) -> str | None:
        if v is None:
            return None
        s = str(v).strip()
        return s or None

    @field_validator("line", mode="before")
    @classmethod
    def _coerce_line(cls, v: object) -> int | None:
        if v is None or v == "":
            return None
        try:
            n = int(v)
            return n if n > 0 else None
        except (TypeError, ValueError):
            return None


class ReviewResult(BaseModel):
    summary: str = "No summary provided."
    findings: list[Finding] = Field(default_factory=list)
    provider: str

    @property
    def max_severity(self) -> Severity:
        if any(f.severity == "error" for f in self.findings):
            return "error"
        if any(f.severity == "warn" for f in self.findings):
            return "warn"
        return "info"

    @property
    def has_blocking_issues(self) -> bool:
        return any(f.severity == "error" for f in self.findings)


class AIProvider(ABC):
    name: str

    @abstractmethod
    async def review(
        self,
        *,
        title: str,
        body: str,
        diff: str,
        extra_prompt: str = "",
    ) -> ReviewResult:
        ...
