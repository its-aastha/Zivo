from tools.app_tools import open_application
from tools.files_tools import create_file, create_folder


def handle_command(command):
    command = command.strip()
    lower_command = command.lower()

    # Open application
    if lower_command.startswith("open "):
        app_name = command[5:].strip()

        if not app_name:
            return "Please tell me which application to open."

        return open_application(app_name)

    # Create file
    elif lower_command.startswith("create file "):
        filename = command[len("create file "):].strip()

        if not filename:
            return "Please provide a file name."

        return create_file(filename)

    # Create folder
    elif lower_command.startswith("create folder "):
        folder_name = command[len("create folder "):].strip()

        if not folder_name:
            return "Please provide a folder name."

        return create_folder(folder_name)

    # Exit
    elif lower_command in ["exit", "quit", "bye"]:
        return "EXIT"

    return "Sorry, I don't understand that command yet."