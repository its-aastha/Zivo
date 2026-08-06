from agent.local_parser import parse
from agent.brain import understand

from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder


def handle_command(command):

    # -------------------------------
    # Try Local Parser First
    # -------------------------------

    task = parse(command)

    # -------------------------------
    # If Local Parser Fails -> Gemini
    # -------------------------------

    if task is None:
        task = understand(command)

        print("\n========== Gemini Output ==========")
        print(task)
        print("===================================\n")

    action = task["action"]

    if action == "open_application":
        return open_application(task["application"])

    elif action == "create_file":
        return create_file(
            task["filename"],
            task["location"]
        )

    elif action == "create_folder":
        return create_folder(
            task["folder_name"],
            task["location"]
        )

    return "Unsupported command."