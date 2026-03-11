"""
Claude LLM wrapper — sends prompts, parses JSON responses.
"""
import json
import re
from anthropic import AsyncAnthropic
from backend.config import ANTHROPIC_API_KEY, CLAUDE_MODEL

client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)


async def analyze_with_claude(system_prompt: str, user_prompt: str) -> dict:
    """Send a prompt to Claude and parse the JSON response."""
    response = await client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    text = response.content[0].text
    return _extract_json(text)


def _extract_json(text: str) -> dict:
    """Extract JSON from Claude's response, handling code blocks."""
    # Try JSON code block first
    match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))

    # Try generic code block
    match = re.search(r"```\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try parsing the whole text as JSON
    # Find the first { and last } to extract JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            pass

    # Try finding array
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1:
        try:
            return {"items": json.loads(text[start : end + 1])}
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from Claude response: {text[:200]}")
