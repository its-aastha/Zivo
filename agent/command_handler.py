from agent.brain import understand

from tools.app_tools import open_application
from tools.file_tools import create_file
from tools.file_tools import create_folder


def handle_command(command):

    task = understand(command)

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