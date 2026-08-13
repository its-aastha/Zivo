from agent.brain import understand

from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder


def extract_application(command: str):
    """
    Fallback application extractor.

    Used when Gemini understands the action but
    does not provide the application name.
    """

    command = command.strip().lower()

    prefixes = [
        "open ",
        "launch ",
        "start ",
        "run "
    ]

    for prefix in prefixes:

        if command.startswith(prefix):

            app = command[len(prefix):].strip()

            # Remove common words
            app = app.replace("please ", "")
            app = app.replace("application ", "")
            app = app.replace("app ", "")

            return app.strip()

    return None


def handle_command(command: str):

    command = command.strip()

    if not command:
        return "Please give me a command."

    # ==========================================
    # STEP 1: UNDERSTAND COMMAND
    # ==========================================

    try:

        result = understand(command)

    except Exception as e:

        print("BRAIN ERROR:", e)

        return f"I couldn't understand the command: {e}"

    print("BRAIN RESULT:", result)

    # ==========================================
    # STEP 2: MAKE SURE RESULT IS DICTIONARY
    # ==========================================

    if not isinstance(result, dict):

        return str(result)

    action = result.get("action")

    print("ACTION:", action)

    # ==========================================
    # OPEN APPLICATION
    # ==========================================

    if action == "open_application":

        app = result.get("app")

        # --------------------------------------
        # FALLBACK
        # --------------------------------------

        if not app:

            print(
                "Gemini did not provide app name."
            )

            app = extract_application(command)

            print(
                "FALLBACK APP:",
                app
            )

        # --------------------------------------
        # STILL NO APP
        # --------------------------------------

        if not app:

            return (
                "I understood that you want "
                "to open an application, "
                "but I don't know which one."
            )

        print(
            f"EXECUTING: open_application({app})"
        )

        try:

            tool_result = open_application(app)

            print(
                "APP TOOL RESULT:",
                tool_result
            )

            return tool_result

        except Exception as e:

            print(
                "OPEN APPLICATION ERROR:",
                e
            )

            return (
                f"Could not open {app}: {e}"
            )

    # ==========================================
    # CREATE FILE
    # ==========================================

    if action == "create_file":

        filename = result.get("filename")

        location = result.get(
            "location",
            "desktop"
        )

        if not filename:

            return (
                "I don't know the name "
                "of the file to create."
            )

        print(
            f"EXECUTING: create_file("
            f"{filename}, {location})"
        )

        try:

            tool_result = create_file(
                filename,
                location
            )

            print(
                "FILE TOOL RESULT:",
                tool_result
            )

            return tool_result

        except Exception as e:

            print(
                "CREATE FILE ERROR:",
                e
            )

            return f"Error creating file: {e}"

    # ==========================================
    # CREATE FOLDER
    # ==========================================

    if action == "create_folder":

        folder_name = result.get(
            "folder_name"
        )

        location = result.get(
            "location",
            "desktop"
        )

        if not folder_name:

            return (
                "I don't know the name "
                "of the folder to create."
            )

        print(
            f"EXECUTING: create_folder("
            f"{folder_name}, {location})"
        )

        try:

            tool_result = create_folder(
                folder_name,
                location
            )

            print(
                "FOLDER TOOL RESULT:",
                tool_result
            )

            return tool_result

        except Exception as e:

            print(
                "CREATE FOLDER ERROR:",
                e
            )

            return f"Error creating folder: {e}"

    # ==========================================
    # UNKNOWN ACTION
    # ==========================================

    return (
        f"I understood your command, "
        f"but I don't know how to execute "
        f"'{action}' yet."
    )