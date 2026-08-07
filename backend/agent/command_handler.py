from agent.local_parser import parse
from agent.brain import understand

from tools.app_tools import open_application
from tools.file_tools import create_file, create_folder


def _is_task_complete(task):
    if task is None:
        return False

    action = task.get("action")

    if action == "open_application":
        return bool(task.get("application"))

    if action == "create_file":
        return bool(task.get("filename")) and bool(task.get("location"))

    if action == "create_folder":
        return bool(task.get("folder_name")) and bool(task.get("location"))

    return False
