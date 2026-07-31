import os
import subprocess
import shutil


def open_application(app_name):
    app_name = app_name.lower().strip()

    try:
        if app_name in ["chrome", "google chrome"]:
            possible_paths = [
                r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
            ]

            for path in possible_paths:
                if os.path.exists(path):
                    subprocess.Popen([path])
                    return "Chrome opened successfully."

            return "Chrome was not found on this computer."

        elif app_name == "notepad":
            subprocess.Popen(["notepad.exe"])
            return "Notepad opened successfully."

        elif app_name in ["calculator", "calc"]:
            subprocess.Popen(["calc.exe"])
            return "Calculator opened successfully."

        elif app_name in ["vs code", "vscode", "visual studio code"]:
            code_path = shutil.which("code")

            if code_path:
                subprocess.Popen([code_path])
                return "VS Code opened successfully."

            return "VS Code command was not found."

        else:
            return f"I don't know how to open '{app_name}' yet."

    except Exception as error:
        return f"Failed to open {app_name}: {error}"