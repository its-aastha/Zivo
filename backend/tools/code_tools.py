from pathlib import Path
import subprocess
import tempfile
import os
import sys
import uuid


# ==========================================
# ZIVO CODE STORAGE
# ==========================================

CODE_STORAGE_DIR = (
    Path(tempfile.gettempdir()) / "zivo_generated_code"
)

CODE_STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# FILE EXTENSIONS
# ==========================================

LANGUAGE_EXTENSIONS = {
    "python": ".py",
    "python3": ".py",
    "java": ".java",
    "javascript": ".js",
    "js": ".js",
    "cpp": ".cpp",
    "c++": ".cpp",
    "c": ".c",
    "html": ".html",
    "css": ".css",
    "json": ".json",
}


# ==========================================
# CREATE CODE FILE
# ==========================================

def create_code_file(
    code: str,
    language: str,
    filename: str | None = None
):
    """
    Create a temporary code file containing
    the exact generated source code.
    """

    language = language.lower().strip()

    extension = LANGUAGE_EXTENSIONS.get(
        language,
        ".txt"
    )

    # --------------------------------------
    # Generate filename
    # --------------------------------------

    if not filename:

        file_id = uuid.uuid4().hex[:8]

        filename = (
            f"zivo_code_{file_id}{extension}"
        )

    else:

        filename = Path(filename).name

        if not Path(filename).suffix:

            filename += extension


    # --------------------------------------
    # Create file path
    # --------------------------------------

    file_path = CODE_STORAGE_DIR / filename


    # --------------------------------------
    # Save exact source code
    # --------------------------------------

    try:

        file_path.write_text(
            code,
            encoding="utf-8"
        )

    except Exception as e:

        raise RuntimeError(
            f"Could not create code file: {e}"
        )


    print(
        "CODE FILE CREATED:",
        file_path
    )


    return {
        "file_id": file_path.stem,
        "filename": file_path.name,
        "file_path": str(file_path),
        "language": language,
    }


# ==========================================
# RUN PYTHON CODE
# ==========================================

def run_python_code(code: str):
    """
    Generate a temporary Python file,
    execute it, and keep the file so
    Zivo can provide it to the user.
    """

    # --------------------------------------
    # Create persistent temporary file
    # --------------------------------------

    file_info = create_code_file(
        code=code,
        language="python"
    )

    file_path = file_info["file_path"]


    # --------------------------------------
    # RUN PYTHON
    # --------------------------------------

    try:

        result = subprocess.run(
            [
                sys.executable,
                file_path
            ],
            capture_output=True,
            text=True,
            timeout=10
        )


        # ----------------------------------
        # SUCCESS
        # ----------------------------------

        if result.returncode == 0:

            return {
                "success": True,
                "output": result.stdout,
                "file_id": file_info["file_id"],
                "filename": file_info["filename"],
                "file_path": file_info["file_path"],
                "language": "python"
            }


        # ----------------------------------
        # EXECUTION ERROR
        # ----------------------------------

        return {
            "success": False,
            "output": result.stderr,
            "file_id": file_info["file_id"],
            "filename": file_info["filename"],
            "file_path": file_info["file_path"],
            "language": "python"
        }


    # --------------------------------------
    # TIMEOUT
    # --------------------------------------

    except subprocess.TimeoutExpired:

        return {
            "success": False,
            "output": "Code execution timed out.",
            "file_id": file_info["file_id"],
            "filename": file_info["filename"],
            "file_path": file_info["file_path"],
            "language": "python"
        }


    # --------------------------------------
    # OTHER ERROR
    # --------------------------------------

    except Exception as e:

        return {
            "success": False,
            "output": str(e),
            "file_id": file_info["file_id"],
            "filename": file_info["filename"],
            "file_path": file_info["file_path"],
            "language": "python"
        }


# ==========================================
# GET CODE FILE
# ==========================================

def get_code_file(file_id: str):
    """
    Find a generated code file using
    its file ID.
    """

    file_id = Path(file_id).name

    matches = list(
        CODE_STORAGE_DIR.glob(
            f"{file_id}.*"
        )
    )

    if not matches:

        return None

    file_path = matches[0]

    return {
        "file_id": file_path.stem,
        "filename": file_path.name,
        "file_path": str(file_path)
    }


# ==========================================
# READ CODE FILE
# ==========================================

def read_code_file(file_id: str):
    """
    Read the exact generated source code.
    """

    file_info = get_code_file(file_id)

    if not file_info:

        return None

    try:

        code = Path(
            file_info["file_path"]
        ).read_text(
            encoding="utf-8"
        )

        return {
            **file_info,
            "code": code
        }

    except Exception as e:

        raise RuntimeError(
            f"Could not read code file: {e}"
        )


# ==========================================
# DELETE CODE FILE
# ==========================================

def delete_code_file(file_id: str):
    """
    Delete a generated code file when
    it is no longer needed.
    """

    file_info = get_code_file(file_id)

    if not file_info:

        return False

    try:

        os.remove(
            file_info["file_path"]
        )

        return True

    except Exception as e:

        print(
            "DELETE CODE FILE ERROR:",
            e
        )

        return False