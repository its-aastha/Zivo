from agent.brain import understand

from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder


def handle_command(command: str):

    command = command.strip()

    # ==========================================
    # STEP 1: UNDERSTAND THE COMMAND
    # ==========================================

    result = understand(command)

    print("BRAIN RESULT:", result)

    # ==========================================
    # STEP 2: CHECK BRAIN RESULT
    # ==========================================

    if not isinstance(result, dict):
        return str(result)

    action = result.get("action")

    print("ACTION:", action)

    # ==========================================
    # CREATE FILE
    # ==========================================

    if action == "create_file":

        filename = result.get("filename")
        location = result.get("location", "desktop")

        if not filename:
            return "I don't know the name of the file to create."

        print(
            f"EXECUTING: create_file("
            f"{filename}, {location})"
        )

        try:
            tool_result = create_file(
                filename,
                location
            )

            print("FILE TOOL RESULT:", tool_result)

            return tool_result

        except Exception as e:

            print("CREATE FILE ERROR:", e)

            return f"Error creating file: {e}"

    # ==========================================
    # CREATE FOLDER
    # ==========================================

    if action == "create_folder":

        folder_name = result.get("foldername")
        location = result.get("location", "desktop")

        if not folder_name:
            return "I don't know the name of the folder to create."

        print(
            f"EXECUTING: create_folder("
            f"{folder_name}, {location})"
        )

        try:
            tool_result = create_folder(
                folder_name,
                location
            )

            print("FOLDER TOOL RESULT:", tool_result)

            return tool_result

        except Exception as e:

            print("CREATE FOLDER ERROR:", e)

            return f"Error creating folder: {e}"

    # ==========================================
    # OPEN APPLICATION
    # ==========================================

    if action == "open_application":

        app = result.get("app")

        if not app:
            return "I don't know which application to open."

        print(
            f"EXECUTING: open_application({app})"
        )

        try:
            tool_result = open_application(app)

            # If your app tool returns a message,
            # use it. Otherwise provide our own.
            if tool_result:
                return str(tool_result)

            return f"{app} opened successfully."

        except Exception as e:

            print("OPEN APPLICATION ERROR:", e)

            return f"Could not open {app}: {e}"

    # ==========================================
    # UNKNOWN ACTION
    # ==========================================

    return (
        f"I understood your command, "
        f"but I don't know how to execute "
        f"'{action}' yet."
    )