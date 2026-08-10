from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder

from agent.brain import understand


def handle_command(command):

    command = command.strip().lower()

    # =========================
    # OPEN APPLICATION
    # =========================

    if command.startswith("open "):

        app = command.replace("open ", "", 1).strip()

        try:
            open_application(app)

            return f"{app} opened successfully."

        except Exception as e:

            return f"I could not open {app}: {str(e)}"

    # =========================
    # CREATE FOLDER
    # =========================

    if command.startswith("create folder "):

        folder_name = command.replace(
            "create folder ",
            "",
            1
        ).strip()

        try:
            create_folder(folder_name)

            return (
                f"Folder {folder_name} "
                f"created successfully."
            )

        except Exception as e:

            return (
                f"I could not create the folder. "
                f"{str(e)}"
            )

    # =========================
    # CREATE FILE
    # =========================

    if command.startswith("create file "):

        file_name = command.replace(
            "create file ",
            "",
            1
        ).strip()

        try:
            create_file(file_name)

            return (
                f"File {file_name} "
                f"created successfully."
            )

        except Exception as e:

            return (
                f"I could not create the file. "
                f"{str(e)}"
            )

    # =========================
    # AI BRAIN
    # =========================

    try:

        result = understand(command)

        return str(result)

    except Exception:

        return (
            "Sorry, I don't understand "
            "that command yet."
        )