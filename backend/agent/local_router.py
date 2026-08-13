import re

# ==========================================
# NORMALIZE FILENAME
# ==========================================

def normalize_filename(value: str) -> str:

    value = value.strip()

    # "Aastha dot txt" -> "Aastha.txt"
    value = re.sub(
        r"\s+dot\s+([a-zA-Z0-9]+)$",
        r".\1",
        value,
        flags=re.IGNORECASE
    )

    return value.strip()


# ==========================================
# EXTRACT LOCATION
# ==========================================

def extract_location(value: str):

    value = value.strip()

    location = "desktop"

    patterns = [
        (r"\s+on\s+the\s+desktop$", "desktop"),
        (r"\s+on\s+desktop$", "desktop"),

        (r"\s+in\s+the\s+desktop$", "desktop"),
        (r"\s+in\s+desktop$", "desktop"),

        (r"\s+in\s+the\s+documents$", "documents"),
        (r"\s+in\s+documents$", "documents"),

        (r"\s+in\s+the\s+downloads$", "downloads"),
        (r"\s+in\s+downloads$", "downloads"),
    ]

    for pattern, detected_location in patterns:

        if re.search(
            pattern,
            value,
            flags=re.IGNORECASE
        ):

            value = re.sub(
                pattern,
                "",
                value,
                flags=re.IGNORECASE
            )

            location = detected_location

            break

    return value.strip(), location


# ==========================================
# FILE TYPE MAPPING
# ==========================================

FILE_TYPES = {

    # Text
    "text": ".txt",
    "text file": ".txt",
    "txt": ".txt",
    "txt file": ".txt",

    # Excel
    "excel": ".xlsx",
    "excel file": ".xlsx",
    "spreadsheet": ".xlsx",
    "spreadsheet file": ".xlsx",

    # Word
    "word": ".docx",
    "word file": ".docx",
    "document": ".docx",
    "document file": ".docx",

    # PDF
    "pdf": ".pdf",
    "pdf file": ".pdf",

    # Python
    "python": ".py",
    "python file": ".py",
    "python script": ".py",

    # Java
    "java": ".java",
    "java file": ".java",

    # JavaScript
    "javascript": ".js",
    "javascript file": ".js",
    "js": ".js",
    "js file": ".js",

    # HTML
    "html": ".html",
    "html file": ".html",

    # CSS
    "css": ".css",
    "css file": ".css",

    # C
    "c": ".c",
    "c file": ".c",

    # C++
    "cpp": ".cpp",
    "cpp file": ".cpp",
    "c++": ".cpp",
    "c++ file": ".cpp",

    # JSON
    "json": ".json",
    "json file": ".json",

    # CSV
    "csv": ".csv",
    "csv file": ".csv",

    # XML
    "xml": ".xml",
    "xml file": ".xml",

    # Executable
    "exe": ".exe",
    "exe file": ".exe",
}


# ==========================================
# CONVERT FILE TYPE
# ==========================================

def convert_file_type(filename: str):

    filename = filename.strip()

    # Already has extension
    if re.search(
        r"\.[a-zA-Z0-9]+$",
        filename
    ):

        return filename

    # "Aastha dot txt"
    if re.search(
        r"\bdot\s+[a-zA-Z0-9]+$",
        filename,
        flags=re.IGNORECASE
    ):

        return normalize_filename(filename)

    # Known file types
    for file_type, extension in FILE_TYPES.items():

        pattern = (
            rf"\s+{re.escape(file_type)}$"
        )

        if re.search(
            pattern,
            filename,
            flags=re.IGNORECASE
        ):

            filename = re.sub(
                pattern,
                "",
                filename,
                flags=re.IGNORECASE
            )

            return filename.strip() + extension

    return filename


# ==========================================
# LOCAL ROUTER
# ==========================================

def local_route(command: str):

    command = command.strip()

    lower = command.lower()


    # ==========================================
    # CODE REQUESTS
    # ==========================================
    # These must go to Gemini.
    # ==========================================

    code_patterns = [

        r"\bwrite\b.*\bcode\b",
        r"\bcreate\b.*\bcode\b",
        r"\bgenerate\b.*\bcode\b",

        r"\bwrite\b.*\bprogram\b",
        r"\bcreate\b.*\bprogram\b",
        r"\bmake\b.*\bprogram\b",

        r"\bwrite\b.*\bscript\b",
        r"\bcreate\b.*\bscript\b",
        r"\bgenerate\b.*\bscript\b",
    ]

    for pattern in code_patterns:

        if re.search(
            pattern,
            lower
        ):

            return None


    # ==========================================
    # OPEN APPLICATION
    # ==========================================

    open_patterns = [
        r"^open\s+(.+)$",
        r"^launch\s+(.+)$",
        r"^start\s+(.+)$",
    ]

    for pattern in open_patterns:

        match = re.match(
            pattern,
            command,
            flags=re.IGNORECASE
        )

        if match:

            app = match.group(1).strip()

            app = re.sub(
                r"\b(application|app|please)\b",
                "",
                app,
                flags=re.IGNORECASE
            )

            return {
                "action": "open_application",
                "app": app.strip()
            }


    # ==========================================
    # CREATE FOLDER
    # ==========================================
    # IMPORTANT:
    # Folder detection comes BEFORE file detection.
    #
    # Supported:
    # create folder Aastha
    # create folder Aastha on desktop
    # create Aastha folder
    # create Aastha folder on desktop
    # create the Aastha folder
    # make Aastha folder
    # ==========================================

    folder_patterns = [

        # create folder Aastha
        r"^create\s+(?:a\s+)?folder\s+(?:named\s+|called\s+)?(.+)$",

        # make folder Aastha
        r"^make\s+(?:a\s+)?folder\s+(?:named\s+|called\s+)?(.+)$",

        # create Aastha folder
        r"^create\s+(?:a\s+)?(.+?)\s+folder(?:\s+(.+))?$",

        # make Aastha folder
        r"^make\s+(?:a\s+)?(.+?)\s+folder(?:\s+(.+))?$",

        # create the Aastha folder
        r"^create\s+the\s+(.+?)\s+folder(?:\s+(.+))?$",

        # make the Aastha folder
        r"^make\s+the\s+(.+?)\s+folder(?:\s+(.+))?$",
    ]


    for pattern in folder_patterns:

        match = re.match(
            pattern,
            command,
            flags=re.IGNORECASE
        )

        if not match:
            continue


        # --------------------------------------
        # Get folder name
        # --------------------------------------

        folder_name = match.group(1).strip()


        # --------------------------------------
        # Get location from folder name
        # --------------------------------------

        folder_name, location = extract_location(
            folder_name
        )


        # --------------------------------------
        # Get location from optional group
        # --------------------------------------

        if match.lastindex is not None:

            if match.lastindex >= 2:

                extra = match.group(2)

                if extra:

                    extra = extra.strip().lower()

                    if extra in [
                        "on desktop",
                        "on the desktop"
                    ]:

                        location = "desktop"

                    elif extra in [
                        "in documents",
                        "in the documents"
                    ]:

                        location = "documents"

                    elif extra in [
                        "in downloads",
                        "in the downloads"
                    ]:

                        location = "downloads"


        # --------------------------------------
        # Remove named/called
        # --------------------------------------

        folder_name = re.sub(
            r"^(named|called)\s+",
            "",
            folder_name,
            flags=re.IGNORECASE
        )

        folder_name = folder_name.strip()


        if folder_name:

            return {
                "action": "create_folder",
                "folder_name": folder_name,
                "location": location
            }


    # ==========================================
    # CREATE FILE
    # ==========================================

    file_patterns = [

        # create a file named Aastha.txt
        r"^create\s+(?:a\s+)?file\s+(?:named\s+|called\s+)?(.+)$",

        # make a file named Aastha.txt
        r"^make\s+(?:a\s+)?file\s+(?:named\s+|called\s+)?(.+)$",

        # create Aastha.txt file
        r"^create\s+(.+?)\s+file(?:\s+(.+))?$",

        # make Aastha.txt file
        r"^make\s+(.+?)\s+file(?:\s+(.+))?$",
    ]


    for pattern in file_patterns:

        match = re.match(
            pattern,
            command,
            flags=re.IGNORECASE
        )

        if not match:
            continue


        filename = match.group(1).strip()


        # --------------------------------------
        # Extract location
        # --------------------------------------

        filename, location = extract_location(
            filename
        )


        # --------------------------------------
        # Remove named/called
        # --------------------------------------

        filename = re.sub(
            r"^(named|called)\s+",
            "",
            filename,
            flags=re.IGNORECASE
        )


        # --------------------------------------
        # Normalize
        # --------------------------------------

        filename = normalize_filename(
            filename
        )

        filename = convert_file_type(
            filename
        )


        if filename:

            return {
                "action": "create_file",
                "filename": filename,
                "location": location
            }


    # ==========================================
    # NATURAL FILE COMMAND
    # ==========================================
    #
    # Examples:
    #
    # create Aastha dot txt on desktop
    # create Aastha excel file on desktop
    # create Aastha pdf file on desktop
    # ==========================================

    natural_pattern = (
        r"^create\s+"
        r"(.+?)"
        r"\s+on\s+"
        r"(?:the\s+)?desktop$"
    )

    match = re.match(
        natural_pattern,
        command,
        flags=re.IGNORECASE
    )


    if match:

        filename = match.group(1).strip()


        # --------------------------------------
        # Don't treat folder requests as files
        # --------------------------------------

        if re.search(
            r"\bfolder\b",
            filename,
            flags=re.IGNORECASE
        ):

            return None


        filename = normalize_filename(
            filename
        )

        filename = convert_file_type(
            filename
        )


        if filename:

            return {
                "action": "create_file",
                "filename": filename,
                "location": "desktop"
            }


    # ==========================================
    # CREATE FILE WITHOUT LOCATION
    # ==========================================

    natural_create_pattern = (
        r"^create\s+(.+)$"
    )

    match = re.match(
        natural_create_pattern,
        command,
        flags=re.IGNORECASE
    )


    if match:

        filename = match.group(1).strip()


        # Never treat folder commands as files
        if re.search(
            r"\bfolder\b",
            filename,
            flags=re.IGNORECASE
        ):

            return None


        # Never treat programming commands as files
        if re.search(
            r"\b(code|program|script)\b",
            filename,
            flags=re.IGNORECASE
        ):

            return None


        filename = normalize_filename(
            filename
        )

        filename = convert_file_type(
            filename
        )


        # Only handle obvious file requests
        if (
            "." in filename
            or re.search(
                r"\b("
                r"file|excel|pdf|word|text|python|java|"
                r"javascript|html|css|csv|json|xml|exe"
                r")\b",
                filename,
                flags=re.IGNORECASE
            )
        ):

            return {
                "action": "create_file",
                "filename": filename,
                "location": "desktop"
            }


    # ==========================================
    # NOTHING LOCAL
    # ==========================================

    return None
