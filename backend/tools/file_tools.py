from pathlib import Path
import os


def resolve_location(location: str):
    """
    Convert a location name into an actual Windows folder.
    Supports Desktop, Documents and Downloads.
    """

    location = location.lower().strip()

    user = Path(os.environ["USERPROFILE"])

    locations = {
        "desktop": [
            user / "Desktop",
            user / "OneDrive" / "Desktop",
        ],
        "documents": [
            user / "Documents",
            user / "OneDrive" / "Documents",
        ],
        "downloads": [
            user / "Downloads",
            user / "OneDrive" / "Downloads",
        ],
    }

    if location in locations:

        for folder in locations[location]:

            if folder.exists():
                return folder

    return None


def create_file(filename: str, location: str = "desktop"):

    folder = resolve_location(location)

    if folder is None:
        return f"Location '{location}' not found."

    file_path = folder / filename

    try:

        # Create parent folders if needed
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Create file if it doesn't exist
        file_path.touch(exist_ok=True)

        return f"File created successfully.\n\nLocation:\n{file_path}"

    except Exception as e:
        return f"Error creating file:\n{e}"


def create_folder(folder_name: str, location: str = "desktop"):

    folder = resolve_location(location)

    if folder is None:
        return f"Location '{location}' not found."

    folder_path = folder / folder_name

    try:

        folder_path.mkdir(parents=True, exist_ok=True)

        return f"Folder created successfully.\n\nLocation:\n{folder_path}"

    except Exception as e:
        return f"Error creating folder:\n{e}"