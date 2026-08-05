import os
from pathlib import Path
#app finder llm 

SEARCH_LOCATIONS = [
    Path(r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs"),
    Path(os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs")),
]

def find_application(app_name):
    app_name = app_name.lower()

    for location in SEARCH_LOCATIONS:
        if not location.exists():
            continue

        for root, _, files in os.walk(location):
            for file in files:
                if file.lower().endswith(".lnk"):
                    name = file.lower().replace(".lnk", "")

                    if app_name in name:
                        return os.path.join(root, file)

    return None