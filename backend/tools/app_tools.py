import os
import subprocess

from tools.app_finder import find_application

#Here you can add the appication whihc you want to add

SYSTEM_COMMANDS = {
    # Basic Apps
    "paint": "mspaint",
    "calculator": "calc",
    "calculator": "calculator",

    "notepad": "notepad",
    "cmd": "cmd",
    "command prompt": "cmd",
    "powershell": "powershell",
    "terminal": "wt",

    # Microsoft Office
    "excel": r"C:\Program Files\Microsoft Office\root\Office16\excel.exe",
    "microsoft excel": r"C:\Program Files\Microsoft Office\root\Office16\excel.exe",

    "word": r"C:\Program Files\Microsoft Office\root\Office16\winword.exe",
    "microsoft word":r"C:\Program Files\Microsoft Office\root\Office16\winword.exe",

    "powerpoint": r"C:\Program Files\Microsoft Office\root\Office16\powerpnt.exe",
    "microsoft powerpoint": r"C:\Program Files\Microsoft Office\root\Office16\powerpnt.exe",

    # Browsers
    "chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "google chrome": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
}
def open_application(app_name):

    app_name = app_name.lower()

    print(f">>> open_application() called with: {app_name}")

    if app_name in SYSTEM_COMMANDS:
        subprocess.Popen(SYSTEM_COMMANDS[app_name], shell=True)
        return f"Opening {app_name}"

    path = find_application(app_name)

    if path:
        subprocess.Popen(path)
        return f"Opening {app_name}"

    return f"{app_name} not found."