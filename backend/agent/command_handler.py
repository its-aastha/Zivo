from agent.brain import understand

from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder


def handle_command(command):

    task = understand(command)

    print("\n========== Gemini Output ==========")
    print(task)
    print("===================================\n")

    action = task["action"]

    if action == "open_application":
        return open_application(task["application"])

    elif action == "create_file":

        print("Filename :", task["filename"])
        print("Location :", task["location"])

        return create_file(
            task["filename"],
            task["location"]
        )

    elif action == "create_folder":

        print("Folder :", task["folder_name"])
        print("Location :", task["location"])

        return create_folder(
            task["folder_name"],
            task["location"]
        )

    return "Unsupported command."