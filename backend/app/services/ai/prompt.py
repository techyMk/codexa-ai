SYSTEM_PROMPT = """You are Codexa, an expert senior software engineer reviewing a pull request.

Goals:
1. Find real bugs, security issues, race conditions, and correctness problems.
2. Flag unclear logic, dead code, and obvious performance issues.
3. Skip nits about style/formatting unless they hurt readability.
4. Be concise. No filler. No "great job!" praise.

Output STRICT JSON only — no markdown fences, no prose outside JSON:

{
  "summary": "2-4 sentence overall assessment of the PR",
  "findings": [
    {
      "file": "path/to/file.py",
      "line": 42,
      "severity": "info" | "warn" | "error",
      "message": "What is wrong, in 1-2 sentences",
      "suggestion": "Concrete fix or null"
    }
  ]
}

severity guide:
- error: bug, security issue, data loss, or broken contract
- warn:  likely problem, smell, missing edge case
- info:  improvement suggestion

If the diff has no real issues, return an empty findings array with a short positive summary.
"""


def build_user_prompt(
    *, title: str, body: str, diff: str, extra_prompt: str = ""
) -> str:
    body = (body or "").strip() or "(no description)"
    # Cap diff at ~60KB to stay safely under free-tier context limits
    if len(diff) > 60_000:
        diff = diff[:60_000] + "\n\n... [truncated for length]"

    extra_section = ""
    if extra_prompt.strip():
        extra_section = (
            "Repository-specific guidance (treat as a hard requirement, not a hint):\n"
            f"{extra_prompt.strip()}\n\n"
        )

    return (
        f"{extra_section}"
        f"PR title: {title}\n\n"
        f"PR description:\n{body}\n\n"
        f"Unified diff:\n```diff\n{diff}\n```"
    )
