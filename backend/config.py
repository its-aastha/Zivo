"""
Configuration settings for Voice Assistant
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Speech-to-Text settings
STT_PROVIDER = os.getenv("STT_PROVIDER", "google")  # google, openai, azure
STT_LANGUAGE = os.getenv("STT_LANGUAGE", "en-US")

# Text-to-Speech settings
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "google")  # google, openai, elevenlabs
TTS_LANGUAGE = os.getenv("TTS_LANGUAGE", "en-US")
TTS_VOICE = os.getenv("TTS_VOICE", "en-US-Neural2-C")

# LLM settings
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo-preview")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "2000"))

# Application settings
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./history.db")
MAX_HISTORY_ITEMS = int(os.getenv("MAX_HISTORY_ITEMS", "100"))

# Audio settings
SAMPLE_RATE = int(os.getenv("SAMPLE_RATE", "16000"))
AUDIO_CHUNK_SIZE = int(os.getenv("AUDIO_CHUNK_SIZE", "1024"))
