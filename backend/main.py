from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent.command_handler import handle_command

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommandRequest(BaseModel):
    command: str


@app.get("/")
def home():
    return {"message": "ZIVO backend is running"}


@app.post("/command")
def execute_command(request: CommandRequest):

    print("USER COMMAND:", request.command)

    result = handle_command(request.command)

    print("ZIVO RESULT:", result)

    return {
        "response": result
    }