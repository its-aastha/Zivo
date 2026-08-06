def parse(command):

    command = command.lower().strip()

    if command.startswith("open "):
        return {
            "action": "open_application",
            "application": command[5:].strip()
        }

    if "create" in command and "file" in command:
        return {
            "action": "create_file"
        }

    if "create" in command and "folder" in command:
        return {
            "action": "create_folder"
        }

    return None