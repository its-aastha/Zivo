import os


def create_file(filename):
    try:
        if os.path.exists(filename):
            return f"{filename} already exists."

        with open(filename, "w", encoding="utf-8"):
            pass

        return f"{filename} created successfully."

    except Exception as error:
        return f"Could not create file: {error}"


def create_folder(folder_name):
    try:
        if os.path.exists(folder_name):
            return f"{folder_name} already exists."

        os.makedirs(folder_name)

        return f"Folder '{folder_name}' created successfully."

    except Exception as error:
        return f"Could not create folder: {error}"