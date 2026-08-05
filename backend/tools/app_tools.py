import os
import subprocess

from tools.app_finder import find_application

SYSTEM_COMMANDS = {
    "paint": "mspaint",
    "calculator": "calc",
    "notepad": "notepad",
    "cmd": "cmd",
    "explorer": "explorer",
}

def open_application(app_name):

    app_name = app_name.lower().strip()

    if app_name in SYSTEM_COMMANDS:
        subprocess.Popen(SYSTEM_COMMANDS[app_name])
        return f"Opening {app_name}..."

    shortcut = find_application(app_name)

    if shortcut:
        os.startfile(shortcut)
        return f"Opening {app_name}..."

    try:
        subprocess.Popen(["cmd", "/c", "start", "", app_name], shell=True)
        return f"Trying to open {app_name}..."
    except Exception:
        return f"I couldn't find '{app_name}'."