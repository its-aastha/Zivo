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

Start the CLI from the `Backend` folder:

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Start the CLI from the `Frontend` folder:

```bash
cd frontend
npm run dev
```

The app will prompt for a command and print the parsed Gemini output before executing the requested action.

## Examples

- `Open Chrome`
- `Create app.py on desktop`
- `Create Project folder in documents`

Type `exit` to quit.

## How it works

User can enter the query using two way :
  - Text 
  - voice command 

it convert the speech-to-text and then perform the speccific task
it store the data in the Drive not on cloud

1. `open_application`
2. `create_file`
3. `create_folder`

The command handler then routes that JSON to the matching tool in `backend/tools/`.

## 📁 Project Structure

```text
zivo/
├── backend/
│   ├── agent/
│   │   ├── brain.py            # AI reasoning & decision engine
│   │   ├── command_handler.py  # Routes parsed commands to execution tools
│   │   ├── local_parser.py     # Fallback local string parser
│   │   └── prompt.py           # System prompts for Gemini
│   ├── tools/
│   │   ├── app_finder.py       # Scans system for installed applications
│   │   ├── app_tools.py        # Logic to launch apps
│   │   └── file_tools.py       # Logic to create files/folders (Desktop, C:\\, etc.)
│   ├── utils/
│   │   ├── fuzzy_match.py      # Matching helper for app names
│   │   └── gemini_client.py   # Gemini API integration wrapper
│   ├── .env                    # Environment variables
│   ├── main.py                 # FastAPI server entry point
│   └── requirements.txt        # Python backend dependencies
│
└── frontend/
    ├── src/
    │   ├── assets/             # Images and design assets
    │   ├── components/
    │   │   └── VoiceButton.jsx # Voice capture component
    │   ├── App.css             # Glassmorphism styling
    │   ├── App.tsx             # Main React application shell
    │   ├── index.css           # Global CSS styles
    │   └── main.tsx            # React DOM rendering entry
    ├── index.html              # Main HTML template
    ├── package.json            # Node dependencies and scripts
    ├── tsconfig.json           # TypeScript configuration
    └── vite.config.ts          # Vite build options
```
## 📸 Dashboard

<p align="center">
  <img src="assets/UI.png" alt="ZIVO Dashboard" width="900">
</p>

## Notes

- File and folder creation currently targets Desktop, Documents, and Downloads, including common OneDrive locations.
- Application launching is Windows-specific because it relies on Windows shell commands and shortcuts.
- If Gemini returns invalid JSON, the current CLI will fail while parsing the response.
