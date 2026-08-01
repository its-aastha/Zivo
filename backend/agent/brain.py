import json

from agent.prompt import SYSTEM_PROMPT
from utils.gemini_client import model


def understand(command):

    response = model.generate_content(
        SYSTEM_PROMPT + "\n\nUser: " + command
    )

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")

    return json.loads(text)