# Zivo

Zivo is a small Windows-focused CLI assistant that uses Gemini to understand simple natural-language requests and turn them into actions.

It currently supports:

- Opening applications such as Chrome, Calculator, Notepad, Paint, Command Prompt, and File Explorer
- Creating files in Desktop, Documents, or Downloads
- Creating folders in Desktop, Documents, or Downloads

## Requirements

- Windows
- Python 3.10+
- A Gemini API key

## Setup

1. Open a terminal in the repository root.
2. Create and activate a virtual environment if you want one.
3. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

4. Add your Gemini API key to an environment file named `.env` inside `backend/`:

```env
GEMINI_API_KEY=your_api_key_here
```

## Run

Start the CLI from the `backend` folder:

```bash
cd backend
python main.py
```

The app will prompt for a command and print the parsed Gemini output before executing the requested action.

## Examples

- `Open Chrome`
- `Create app.py on desktop`
- `Create Project folder in documents`

Type `exit` to quit.

## How it works

The CLI sends each user command to Gemini with a fixed system prompt. Gemini must return JSON describing one of three actions:

1. `open_application`
2. `create_file`
3. `create_folder`

The command handler then routes that JSON to the matching tool in `backend/tools/`.

## Project Structure

```text
backend/
  main.py
  requirements.txt
  agent/
    brain.py
    command_handler.py
    prompt.py
  tools/
    app_finder.py
    app_tools.py
    file_tools.py
  utils/
    gemini_client.py
    fuzzy_match.py
```

## Notes

- File and folder creation currently targets Desktop, Documents, and Downloads, including common OneDrive locations.
- Application launching is Windows-specific because it relies on Windows shell commands and shortcuts.
- If Gemini returns invalid JSON, the current CLI will fail while parsing the response.