
# ==========================================
# LOCAL COMMAND PARSER
# ==========================================
# This parser handles simple commands locally
# without calling Gemini.
#
# Example:
# "open youtube"
#      ↓
# {"action": "open_website", "website": "youtube"}
#
# This makes common commands faster and also
# allows them to work when Gemini quota is
# unavailable.


# ==========================================
# WEBSITE NAMES
# ==========================================
# These names are treated as websites instead
# of Windows applications.

WEBSITE_NAMES = {
    "youtube",
    "spotify",
    "google",
    "github",
    "chatgpt",
    "instagram",
    "facebook",
    "linkedin",
    "gmail",
    "whatsapp",
    "google maps",
    "maps",
    "netflix",
    "amazon",
    "reddit",
    "x",
    "twitter",
}


# ==========================================
# EXTRACT OPEN TARGET
# ==========================================

def extract_open_target(command: str):

    # Supported ways of saying "open".
    prefixes = [
        "open ",
        "launch ",
        "start ",
        "go to ",
    ]

    for prefix in prefixes:

        if command.startswith(prefix):

            target = command[len(prefix):].strip()

            # Remove polite words and common
            # browser-related phrases.
            target = target.replace("please ", "")
            target = target.replace("the ", "")
            target = target.replace(" in browser", "")
            target = target.replace(" in the browser", "")
            target = target.strip()

            return target

    return None


# ==========================================
# MAIN PARSER
# ==========================================

def parse(command):

    command = command.lower().strip()

    # --------------------------------------
    # OPEN WEBSITE / APPLICATION
    # --------------------------------------

    target = extract_open_target(command)

    if target:

        # If the target is a known website,
        # return a browser-specific action.
        if target in WEBSITE_NAMES:

            return {
                "action": "open_website",
                "website": target
            }

        # If the target looks like a URL,
        # open it in the default browser.
        if (
            target.startswith("http://")
            or target.startswith("https://")
            or "." in target
        ):

            return {
                "action": "open_website",
                "website": target
            }

        # Otherwise, treat it as a normal
        # Windows application.
        return {
            "action": "open_application",
            "app": target
        }

    # --------------------------------------
    # CREATE FILE
    # --------------------------------------

    if "create" in command and "file" in command:

        return {
            "action": "create_file"
        }

    # --------------------------------------
    # CREATE FOLDER
    # --------------------------------------

    if "create" in command and "folder" in command:

        return {
            "action": "create_folder"
        }

    return None

