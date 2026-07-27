"""
Helper Utilities
General utility functions for the application
"""
import logging
import os
import json
from typing import Any, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

def setup_logging(log_level: str = "INFO") -> None:
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def ensure_directories() -> None:
    """Ensure all required directories exist"""
    directories = [
        "data",
        "logs",
        "uploads",
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

def save_json(data: Dict[str, Any], filepath: str) -> bool:
    """Save data to JSON file"""
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        return True
    except Exception as e:
        logger.error(f"Error saving JSON: {e}")
        return False

def load_json(filepath: str) -> Dict[str, Any]:
    """Load data from JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception as e:
        logger.error(f"Error loading JSON: {e}")
        return {}

def get_timestamp() -> str:
    """Get current timestamp"""
    return datetime.now().isoformat()

def validate_audio_file(filename: str) -> bool:
    """Validate if file is an audio file"""
    valid_extensions = {'.wav', '.mp3', '.ogg', '.flac', '.m4a'}
    _, ext = os.path.splitext(filename)
    return ext.lower() in valid_extensions

def truncate_text(text: str, max_length: int = 200) -> str:
    """Truncate text to specified length"""
    if len(text) > max_length:
        return text[:max_length] + "..."
    return text
