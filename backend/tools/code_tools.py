import subprocess
import tempfile
import os


def run_python_code(code: str):

    file_path = None

    try:

        # --------------------------------------
        # CREATE TEMPORARY PYTHON FILE
        # --------------------------------------

        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as file:

            file.write(code)

            file_path = file.name


        # --------------------------------------
        # RUN PYTHON
        # --------------------------------------

        result = subprocess.run(
            ["python", file_path],
            capture_output=True,
            text=True,
            timeout=10
        )


        # --------------------------------------
        # SUCCESS
        # --------------------------------------

        if result.returncode == 0:

            return {
                "success": True,
                "output": result.stdout
            }


        # --------------------------------------
        # ERROR
        # --------------------------------------

        return {
            "success": False,
            "output": result.stderr
        }


    except subprocess.TimeoutExpired:

        return {
            "success": False,
            "output": "Code execution timed out."
        }


    except Exception as e:

        return {
            "success": False,
            "output": str(e)
        }


    finally:

        # --------------------------------------
        # DELETE TEMP FILE
        # --------------------------------------

        if file_path and os.path.exists(file_path):

            try:

                os.remove(file_path)

            except Exception:

                pass