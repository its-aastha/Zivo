"""
Conversation Memory Service
Manages conversation history and context
"""
import json
from typing import List, Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ConversationMemory:
    """Manages conversation history for users"""
    
    def __init__(self, max_items: int = 100):
        """Initialize memory manager"""
        self.max_items = max_items
        self.conversations: Dict[str, List[Dict]] = {}
        self._load_history()
    
    def add_message(self, user_id: str, role: str, content: str):
        """Add a message to conversation history"""
        try:
            if user_id not in self.conversations:
                self.conversations[user_id] = []
            
            message = {
                "timestamp": datetime.now().isoformat(),
                "role": role,
                "content": content
            }
            
            self.conversations[user_id].append(message)
            
            # Keep only recent messages
            if len(self.conversations[user_id]) > self.max_items:
                self.conversations[user_id] = self.conversations[user_id][-self.max_items:]
            
            self._save_history()
        except Exception as e:
            logger.error(f"Error adding message: {e}")
            raise
    
    def get_history(self, user_id: str) -> List[Dict]:
        """Get conversation history for a user"""
        return self.conversations.get(user_id, [])
    
    def clear_history(self, user_id: str):
        """Clear conversation history for a user"""
        if user_id in self.conversations:
            del self.conversations[user_id]
            self._save_history()
    
    def get_recent_context(self, user_id: str, num_messages: int = 5) -> List[Dict]:
        """Get recent messages for context"""
        history = self.get_history(user_id)
        return history[-num_messages:] if history else []
    
    def _save_history(self):
        """Save history to file"""
        try:
            with open("data/history.json", "w") as f:
                json.dump(self.conversations, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save history: {e}")
    
    def _load_history(self):
        """Load history from file"""
        try:
            with open("data/history.json", "r") as f:
                self.conversations = json.load(f)
        except FileNotFoundError:
            self.conversations = {}
        except Exception as e:
            logger.warning(f"Could not load history: {e}")
            self.conversations = {}
