"""
Language Model Service
Handles AI responses using OpenAI GPT or Google Gemini
"""
from config import LLM_MODEL, LLM_TEMPERATURE, LLM_MAX_TOKENS, OPENAI_API_KEY, GOOGLE_API_KEY
from services.memory import ConversationMemory
import logging

logger = logging.getLogger(__name__)
memory = ConversationMemory()

def generate_response(user_input: str, user_id: str = "default") -> str:
    """
    Generate AI response based on user input
    
    Args:
        user_input: User's text input
        user_id: User identifier for context
        
    Returns:
        AI-generated response
    """
    try:
        # Get conversation history for context
        history = memory.get_history(user_id)
        
        # Format messages for API
        messages = _format_messages(history, user_input)
        
        # Generate response based on model
        if "gpt" in LLM_MODEL.lower():
            response = _generate_openai_response(messages)
        elif "gemini" in LLM_MODEL.lower():
            response = _generate_gemini_response(messages)
        else:
            raise ValueError(f"Unsupported LLM model: {LLM_MODEL}")
        
        return response
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise

def _format_messages(history: list, user_input: str) -> list:
    """Format conversation history for API"""
    messages = []
    
    for msg in history[-10:]:  # Last 10 messages for context
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    messages.append({
        "role": "user",
        "content": user_input
    })
    
    return messages

def _generate_openai_response(messages: list) -> str:
    """Generate response using OpenAI GPT"""
    try:
        import openai
        
        openai.api_key = OPENAI_API_KEY
        
        response = openai.ChatCompletion.create(
            model=LLM_MODEL,
            messages=messages,
            temperature=LLM_TEMPERATURE,
            max_tokens=LLM_MAX_TOKENS,
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI LLM error: {e}")
        raise

def _generate_gemini_response(messages: list) -> str:
    """Generate response using Google Gemini"""
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel(LLM_MODEL)
        
        # Convert messages to Gemini format
        chat = model.start_chat(history=_convert_to_gemini_history(messages[:-1]))
        
        response = chat.send_message(messages[-1]["content"])
        
        return response.text
    except Exception as e:
        logger.error(f"Gemini LLM error: {e}")
        raise

def _convert_to_gemini_history(messages: list) -> list:
    """Convert OpenAI message format to Gemini format"""
    gemini_history = []
    for msg in messages:
        gemini_history.append({
            "role": "user" if msg["role"] == "user" else "model",
            "parts": [{"text": msg["content"]}]
        })
    return gemini_history
