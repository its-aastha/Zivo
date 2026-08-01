from pathlib import Path


def resolve_location(location):
    """Convert a location name into an actual Windows path."""

    location = location.lower().strip()
    home = Path.home()

    locations = {
        "desktop": home / "Desktop",
        "documents": home / "Documents",
        "downloads": home / "Downloads",
    }

    # Desktop / Documents / Downloads
    if location in locations:
        return locations[location]

    # Custom path such as C:\Users\Aastha\Test
    custom_path = Path(location)

    if custom_path.exists() and custom_path.is_dir():
        return custom_path

    return None


def create_file(filename, location="desktop"):
    """Create a file at the given location."""

    folder = resolve_location(location)

    if folder is None:
        return f"Location '{location}' was not found."

    file_path = folder / filename

    try:
        if file_path.exists():
            return f"File '{filename}' already exists at {folder}"

        file_path.touch()

        return f"File '{filename}' created successfully at {file_path}"

    except Exception as error:
        return f"Error creating file: {error}"


def create_folder(folder_name, location="desktop"):
    """Create a folder at the given location."""

    folder = resolve_location(location)

    if folder is None:
        return f"Location '{location}' was not found."

    folder_path = folder / folder_name

    try:
        if folder_path.exists():
            return f"Folder '{folder_name}' already exists at {folder}"

        folder_path.mkdir(parents=True)

        return f"Folder '{folder_name}' created successfully at {folder_path}"

    except Exception as error:
        return f"Error creating folder: {error}"