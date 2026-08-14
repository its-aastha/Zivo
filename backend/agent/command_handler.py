from agent.brain import understand, generate_code
from agent.local_router import local_route

from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder
from tools.code_tools import (
    run_python_code,
    create_code_file
)


# ==========================================
# FALLBACK APPLICATION EXTRACTOR
# ==========================================

def extract_application(command: str):

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

            app = app.replace("please ", "")
            app = app.replace("application ", "")
            app = app.replace("app ", "")

            return app.strip()

    return None


# ==========================================
# MAIN COMMAND HANDLER
# ==========================================

def handle_command(command: str):

    command = command.strip()

    if not command:
        return "Please give me a command."


    # ==========================================
    # STEP 1: LOCAL ROUTER
    # ==========================================

    local_result = local_route(command)

    if local_result:

        print(
            "LOCAL ROUTER RESULT:",
            local_result
        )

        result = local_result

    else:

        # ==========================================
        # STEP 2: GEMINI
        # ==========================================

        try:

            result = understand(command)

        except Exception as e:

            print(
                "BRAIN ERROR:",
                e
            )

            return (
                f"I couldn't understand "
                f"the command: {e}"
            )


    # ==========================================
    # SHOW BRAIN RESULT
    # ==========================================

    print(
        "BRAIN RESULT:",
        result
    )


    # ==========================================
    # VALIDATE RESULT
    # ==========================================

    if not isinstance(result, dict):

        return "I couldn't understand the command."


    action = result.get("action")

    print(
        "ACTION:",
        action
    )


    # ==========================================
    # GEMINI / AI ERROR
    # ==========================================

    if action == "error":

        message = result.get(
            "message",
            "Unknown AI error."
        )

        if (
            "429" in message
            or "RESOURCE_EXHAUSTED" in message
            or "quota" in message.lower()
        ):

            return (
                "Gemini API quota has been exhausted. "
                "Local Zivo commands will still work, "
                "but AI commands require available Gemini quota."
            )

        return (
            f"Zivo encountered an AI error: "
            f"{message}"
        )


    # ==========================================
    # GENERATE CODE
    # ==========================================

    if action == "generate_code":

        language = result.get("language")
        task = result.get("task")


        # --------------------------------------
        # VALIDATE LANGUAGE
        # --------------------------------------

        if not language:

            return {
                "type": "error",
                "message": (
                    "I don't know which "
                    "programming language to use."
                )
            }


        # --------------------------------------
        # VALIDATE TASK
        # --------------------------------------

        if not task:

            return {
                "type": "error",
                "message": (
                    "I don't know what code "
                    "you want me to create."
                )
            }


        print(
            "LANGUAGE:",
            language
        )

        print(
            "TASK:",
            task
        )


        # ======================================
        # GENERATE CODE
        # ======================================

        try:

            code = generate_code(
                task,
                language
            )

        except Exception as e:

            print(
                "CODE GENERATION ERROR:",
                e
            )

            return {
                "type": "error",
                "message": (
                    f"Could not generate code: {e}"
                )
            }


        print("\nGENERATED CODE:")
        print("----------------")
        print(code)
        print("----------------")


        # ======================================
        # PYTHON
        # ======================================

        if language.lower() in [
            "python",
            "python3"
        ]:

            try:

                execution = run_python_code(
                    code
                )

            except Exception as e:

                print(
                    "CODE EXECUTION ERROR:",
                    e
                )

                return {
                    "type": "code",
                    "language": "python",
                    "code": code,
                    "filename": "generated.py",
                    "file_id": None,
                    "success": False,
                    "output": str(e)
                }


            # ----------------------------------
            # SUCCESS
            # ----------------------------------

            if execution["success"]:

                output = (
                    execution.get(
                        "output",
                        ""
                    )
                    .strip()
                )

                return {
                    "type": "code",
                    "language": "python",
                    "filename": execution.get(
                        "filename"
                    ),
                    "file_id": execution.get(
                        "file_id"
                    ),
                    "success": True,
                    "output": output
                }


            # ----------------------------------
            # EXECUTION ERROR
            # ----------------------------------

            return {
                "type": "code",
                "language": "python",
                "filename": execution.get(
                    "filename"
                ),
                "file_id": execution.get(
                    "file_id"
                ),
                "success": False,
                "output": execution.get(
                    "output",
                    "Unknown execution error."
                )
            }


        # ======================================
        # OTHER LANGUAGES
        # ======================================

        try:

            file_info = create_code_file(
                code=code,
                language=language
            )

        except Exception as e:

            print(
                "CODE FILE ERROR:",
                e
            )

            return {
                "type": "error",
                "message": (
                    f"Could not create code file: {e}"
                )
            }


        return {
            "type": "code",
            "language": language,
            "filename": file_info["filename"],
            "file_id": file_info["file_id"],
            "success": True,
            "output": ""
        }


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

            app = extract_application(
                command
            )

            print(
                "FALLBACK APP:",
                app
            )


        # --------------------------------------
        # NO APP
        # --------------------------------------

        if not app:

            return (
                "I understood that you want "
                "to open an application, "
                "but I don't know which one."
            )


        print(
            f"EXECUTING: "
            f"open_application({app})"
        )


        try:

            tool_result = open_application(
                app
            )

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

        filename = result.get(
            "filename"
        )

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

            return (
                f"Error creating file: {e}"
            )


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

            return (
                f"Error creating folder: {e}"
            )


    # ==========================================
    # UNSUPPORTED
    # ==========================================

    if action == "unsupported":

        return (
            "I understood your command, "
            "but I don't know how to execute "
            "it yet."
        )


    # ==========================================
    # UNKNOWN ACTION
    # ==========================================

    return (
        f"I understood your command, "
        f"but I don't know how to execute "
        f"'{action}' yet."
    )