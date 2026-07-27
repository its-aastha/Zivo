"""
Speech-to-Text Service
Converts audio to text using Google Cloud Speech-to-Text or OpenAI Whisper
"""
from config import STT_PROVIDER, STT_LANGUAGE, OPENAI_API_KEY
import logging

logger = logging.getLogger(__name__)

def transcribe_audio(audio_data: bytes) -> str:
    """
    Transcribe audio to text
    
    Args:
        audio_data: Audio data in bytes
        
    Returns:
        Transcribed text
    """
    try:
        if STT_PROVIDER == "google":
            return _transcribe_google(audio_data)
        elif STT_PROVIDER == "openai":
            return _transcribe_openai(audio_data)
        else:
            raise ValueError(f"Unsupported STT provider: {STT_PROVIDER}")
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        raise

def _transcribe_google(audio_data: bytes) -> str:
    """Transcribe using Google Cloud Speech-to-Text"""
    try:
        from google.cloud import speech
        
        client = speech.SpeechClient()
        
        audio = speech.RecognitionAudio(content=audio_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=STT_LANGUAGE,
        )
        
        response = client.recognize(config=config, audio=audio)
        
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript
        
        return transcript
    except Exception as e:
        logger.error(f"Google STT error: {e}")
        raise

def _transcribe_openai(audio_data: bytes) -> str:
    """Transcribe using OpenAI Whisper"""
    try:
        import openai
        from io import BytesIO
        
        openai.api_key = OPENAI_API_KEY
        
        audio_file = BytesIO(audio_data)
        audio_file.name = "audio.wav"
        
        transcript = openai.Audio.transcribe(
            model="whisper-1",
            file=audio_file,
            language=STT_LANGUAGE.split("-")[0]
        )
        
        return transcript["text"]
    except Exception as e:
        logger.error(f"OpenAI STT error: {e}")
        raise
