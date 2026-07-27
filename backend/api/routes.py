"""
API routes for Voice Assistant
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services import llm, stt, tts
from services.memory import ConversationMemory

router = APIRouter(prefix="/api", tags=["voice-assistant"])

# Initialize memory manager
memory = ConversationMemory()

# Pydantic models
class TextRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class AudioRequest(BaseModel):
    audio_data: str  # base64 encoded
    user_id: Optional[str] = None

class AssistantResponse(BaseModel):
    response_text: str
    audio_url: Optional[str] = None
    timestamp: str

# Routes
@router.post("/process-text")
async def process_text(request: TextRequest):
    """Process text input and return AI response"""
    try:
        # Get AI response
        response = llm.generate_response(request.text)
        
        # Store in memory
        memory.add_message(request.user_id or "anonymous", "user", request.text)
        memory.add_message(request.user_id or "anonymous", "assistant", response)
        
        # Generate audio
        audio_data = tts.synthesize_speech(response)
        
        return AssistantResponse(
            response_text=response,
            audio_url=audio_data,
            timestamp=str(__import__('datetime').datetime.now())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-audio")
async def process_audio(file: UploadFile = File(...)):
    """Process audio input and return AI response"""
    try:
        # Read audio file
        audio_data = await file.read()
        
        # Convert speech to text
        text = stt.transcribe_audio(audio_data)
        
        # Get AI response
        response = llm.generate_response(text)
        
        # Generate audio response
        audio_response = tts.synthesize_speech(response)
        
        return AssistantResponse(
            response_text=response,
            audio_url=audio_response,
            timestamp=str(__import__('datetime').datetime.now())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_conversation_history(user_id: str):
    """Get conversation history for a user"""
    try:
        history = memory.get_history(user_id)
        return {"user_id": user_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{user_id}")
async def clear_conversation_history(user_id: str):
    """Clear conversation history for a user"""
    try:
        memory.clear_history(user_id)
        return {"status": "cleared", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
