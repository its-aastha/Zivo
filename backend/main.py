from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from agent.command_handler import handle_command

from tools.code_tools import (
    get_code_file,
    read_code_file
)


app = FastAPI()


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODEL
# ==========================================

class CommandRequest(BaseModel):
    command: str


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "ZIVO backend is running"
    }


# ==========================================
# COMMAND
# ==========================================

@app.post("/command")
def execute_command(
    request: CommandRequest
):

    print(
        "USER COMMAND:",
        request.command
    )

    result = handle_command(
        request.command
    )

    print(
        "ZIVO RESULT:",
        result
    )

    return {
        "response": result
    }


# ==========================================
# OPEN / READ GENERATED CODE
# ==========================================

@app.get("/code/{file_id}")
def open_generated_code(
    file_id: str
):

    print(
        "OPEN CODE REQUEST:",
        file_id
    )

    file_info = get_code_file(
        file_id
    )

    if not file_info:

        raise HTTPException(
            status_code=404,
            detail="Generated code file not found."
        )

    try:

        code_data = read_code_file(
            file_id
        )

        if not code_data:

            raise HTTPException(
                status_code=404,
                detail="Could not read generated code."
            )

        return {
            "type": "code",
            "file_id": code_data["file_id"],
            "filename": code_data["filename"],
            "code": code_data["code"]
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "READ CODE ERROR:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================
# DOWNLOAD GENERATED CODE
# ==========================================

@app.get("/code/{file_id}/download")
def download_generated_code(
    file_id: str
):

    print(
        "DOWNLOAD CODE REQUEST:",
        file_id
    )

    file_info = get_code_file(
        file_id
    )

    if not file_info:

        raise HTTPException(
            status_code=404,
            detail="Generated code file not found."
        )

    return FileResponse(
        path=file_info["file_path"],
        filename=file_info["filename"],
        media_type="application/octet-stream"
    )

# How to run the project :
#.venv\Scripts\activate 
#cd backend
#uvicorn main:app --reload

#cd frontend
#npm run dev