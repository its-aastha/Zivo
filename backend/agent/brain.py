
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# ==========================================
# LOAD ENVIRONMENT
# ==========================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# ==========================================
# GEMINI API
# ==========================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        f"GEMINI_API_KEY not found.\n"
        f"Expected .env file at: {ENV_FILE}"
    )

print("GEMINI API KEY LOADED: True")


client = genai.Client(
    api_key=api_key
)


# ==========================================
# UNDERSTAND COMMAND
# ==========================================

def understand(command: str):

    prompt = f"""
You are Zivo's command understanding system.

Understand the user's command and return ONLY valid JSON.

Available actions:

- open_application
- open_website
- create_file
- create_folder
- generate_code
- unsupported


========================================
OPEN APPLICATION
========================================

If the user wants to open a desktop application,
use open_application.

Examples:

User:
open chrome

Return:

{{
    "action": "open_application",
    "app": "chrome"
}}


User:
open calculator

Return:

{{
    "action": "open_application",
    "app": "calculator"
}}


IMPORTANT:

- Use open_application for desktop applications.
- Do not use open_application for websites
  such as YouTube, Spotify, GitHub, or Instagram.


========================================
OPEN WEBSITE
========================================

If the user wants to open a website in the
default browser, use open_website.

Examples:

User:
open youtube

Return:

{{
    "action": "open_website",
    "website": "youtube"
}}


User:
open spotify

Return:

{{
    "action": "open_website",
    "website": "spotify"
}}


User:
launch github

Return:

{{
    "action": "open_website",
    "website": "github"
}}


User:
open chatgpt in browser

Return:

{{
    "action": "open_website",
    "website": "chatgpt"
}}


User:
go to instagram

Return:

{{
    "action": "open_website",
    "website": "instagram"
}}


User:
open google maps

Return:

{{
    "action": "open_website",
    "website": "google maps"
}}


IMPORTANT:

- Use open_website for websites.
- The website will be opened in the
  operating system's default browser.
- Return only the website name, not the full URL,
  unless the user explicitly provides a URL.
- Do not return open_application for websites.


========================================
CREATE FILE
========================================

If the user wants to create a file:

User:
create a file named test.txt on desktop

Return:

{{
    "action": "create_file",
    "filename": "test.txt",
    "location": "desktop"
}}


========================================
CREATE FOLDER
========================================

If the user wants to create a folder:

User:
create a folder named Aastha on desktop

Return:

{{
    "action": "create_folder",
    "folder_name": "Aastha",
    "location": "desktop"
}}


========================================
GENERATE CODE
========================================

If the user asks to:

- write code
- create code
- generate code
- make a program
- write a program
- create a program

then use generate_code.

Example:

User:
write a python code for factorial

Return:

{{
    "action": "generate_code",
    "language": "python",
    "task": "write a Python program to calculate the factorial of a number"
}}


Example:

User:
create python code for fibonacci

Return:

{{
    "action": "generate_code",
    "language": "python",
    "task": "write a Python program to generate the Fibonacci series"
}}


Example:

User:
make a Java program for palindrome

Return:

{{
    "action": "generate_code",
    "language": "java",
    "task": "write a Java program to check whether a number is a palindrome"
}}


Example:

User:
write C++ code to reverse a string

Return:

{{
    "action": "generate_code",
    "language": "cpp",
    "task": "write a C++ program to reverse a string"
}}


========================================
UNSUPPORTED
========================================

Only return unsupported if the command does not match
any of the available actions.


========================================
USER COMMAND
========================================

{command}


Return ONLY valid JSON.

Do not explain anything.
Do not use markdown.
Do not use ```json.
"""


    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        text = (response.text or "").strip()

        print("RAW BRAIN RESPONSE:", text)


        if not text:

            print("GEMINI RETURNED EMPTY RESPONSE")

            return {
                "action": "unsupported"
            }


        # Remove markdown fences if Gemini adds them.
        if text.startswith("```"):

            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()


        # Parse the AI response as JSON.
        try:

            result = json.loads(text)

            if isinstance(result, dict):

                return result

            return {
                "action": "unsupported"
            }

        except json.JSONDecodeError as e:

            print("JSON ERROR:", e)
            print("RAW RESPONSE:", response.text)

            return {
                "action": "unsupported"
            }


    except Exception as e:

        print("GEMINI ERROR:", e)

        return {
            "action": "unsupported"
        }


# ==========================================
# GENERATE CODE
# ==========================================

def generate_code(task: str, language: str):

    prompt = f"""
You are Zivo's programming code generator.

Generate executable {language} code for this task:

{task}


Requirements:

1. Return ONLY source code.
2. Do not use markdown.
3. Do not use ```python.
4. Do not explain the code.
5. The code must be executable.
6. The program must print a useful result.
7. If an input is required but the user did not provide one,
   use a simple example input.


Task:
{task}
"""


    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        code = (response.text or "").strip()


        if not code:

            raise RuntimeError(
                "Gemini returned empty code."
            )


        # Remove markdown fences if Gemini adds them.
        if code.startswith("```"):

            code = code.replace("```python", "")
            code = code.replace("```", "")
            code = code.strip()


        print("GENERATED CODE:")
        print(code)


        return code


    except Exception as e:

        print("CODE GENERATION ERROR:", e)

        raise RuntimeError(
            f"Could not generate code: {e}"
        )
