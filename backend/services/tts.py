"""
Text-to-Speech Service
Converts text to audio using Google Cloud Text-to-Speech or other providers
"""
import base64
from config import TTS_PROVIDER, TTS_LANGUAGE, TTS_VOICE, OPENAI_API_KEY, GOOGLE_API_KEY
import logging

logger = logging.getLogger(__name__)

def synthesize_speech(text: str) -> str:
    """
    Convert text to speech
    
    Args:
        text: Text to convert to speech
        
    Returns:
        Base64 encoded audio data
    """
    try:
        if TTS_PROVIDER == "google":
            audio_data = _synthesize_google(text)
        elif TTS_PROVIDER == "openai":
            audio_data = _synthesize_openai(text)
        else:
            raise ValueError(f"Unsupported TTS provider: {TTS_PROVIDER}")
        
        # Return base64 encoded audio
        return base64.b64encode(audio_data).decode('utf-8')
    except Exception as e:
        logger.error(f"Error synthesizing speech: {e}")
        raise

def _synthesize_google(text: str) -> bytes:
    """Synthesize speech using Google Cloud Text-to-Speech"""
    try:
        from google.cloud import texttospeech
        
        client = texttospeech.TextToSpeechClient()
        
        input_text = texttospeech.SynthesisInput(text=text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=TTS_LANGUAGE,
            name=TTS_VOICE,
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
        )
        
        response = client.synthesize_speech(
            input=input_text,
            voice=voice,
            audio_config=audio_config,
        )
        
        return response.audio_content
    except Exception as e:
        logger.error(f"Google TTS error: {e}")
        raise

def _synthesize_openai(text: str) -> bytes:
    """Synthesize speech using OpenAI TTS"""
    try:
        import openai
        from io import BytesIO
        
        openai.api_key = OPENAI_API_KEY
        
        response = openai.Audio.create(
            model="tts-1",
            voice="alloy",
            input=text,
        )
        
        audio_data = BytesIO()
        for chunk in response.iter_bytes():
            audio_data.write(chunk)
        
        return audio_data.getvalue()
    except Exception as e:
        logger.error(f"OpenAI TTS error: {e}")
        raise
