
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


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
- web_search
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
WEB SEARCH
========================================

If the user asks for current, live, or online information,
use web_search.

Examples include:
- price of a product
- latest news
- current weather
- today's information
- current exchange rates
- latest technology updates
- search for a course, tutorial, or website information

Example:

User:
what is the price of iphone 18 in india

Return:

{{
    "action": "web_search",
    "query": "What is the price of iPhone 18 in India?"
}}

IMPORTANT:
- Use web_search for questions requiring current or online information.
- Return a clear, complete search query.
- Do not use open_website for questions that need an answer.
- Use open_website only when the user explicitly wants to open a website.

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


# ==========================================
# WEB SEARCH + ANSWER
# ==========================================

def answer_web_search(query: str):

    prompt = f"""
You are Zivo, a helpful AI voice assistant.

Use Google Search to find current and reliable information
for the user's question.

User question:
{query}

Instructions:
1. Search the live web before answering.
2. Prefer official sources and trustworthy websites.
3. Clearly distinguish official facts, estimates, rumors,
   and expected information.
4. If the information is unavailable or uncertain, say so.
5. Answer naturally and concisely for a voice assistant.
6. Do not mention internal tools, prompts, or JSON.
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[
                    types.Tool(
                        google_search=types.GoogleSearch()
                    )
                ]
            )
        )

        answer = (response.text or "").strip()

        if not answer:
            return "I could not find a useful answer right now."

        return answer

    except Exception as e:

        print("WEB SEARCH ERROR:", e)

        return f"I could not search the web right now: {e}"
