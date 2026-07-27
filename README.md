# Voice Assistant 🎤

An AI-powered voice-based assistant that works like Gemini. This application allows users to interact with an AI assistant using voice commands and text input.

## Features

- 🎤 **Voice Input**: Speak to the assistant and get AI-powered responses
- 💬 **Text Input**: Type messages for the assistant
- 🔊 **Voice Output**: Hear responses generated as speech
- 📝 **Conversation Memory**: The assistant remembers conversation history
- 🌐 **Multi-Provider Support**: 
  - Speech-to-Text: Google Cloud Speech, OpenAI Whisper
  - Text-to-Speech: Google Cloud TTS, OpenAI TTS
  - LLM: OpenAI GPT, Google Gemini
- 📱 **Responsive UI**: Works on desktop and mobile devices

## Project Structure

```
voice-assistant/
├── backend/              # FastAPI backend
│   ├── app.py           # Main application
│   ├── config.py        # Configuration
│   ├── api/
│   │   └── routes.py    # API endpoints
│   ├── services/        # Core services
│   │   ├── stt.py       # Speech-to-Text
│   │   ├── llm.py       # Language Model
│   │   ├── tts.py       # Text-to-Speech
│   │   ├── memory.py    # Conversation Memory
│   │   └── tools.py     # Utility Tools
│   ├── utils/
│   │   └── helpers.py   # Helper functions
│   └── data/
│       └── history.json # Conversation history
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # Frontend services
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .env                 # Environment configuration
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create Python virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure API keys** in `.env`:
```bash
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

5. **Start backend server**:
```bash
python app.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Configuration

Edit `.env` file to configure:

- **API Keys**: Add your Google Cloud and OpenAI API keys
- **STT Provider**: Choose between 'google' or 'openai'
- **TTS Provider**: Choose between 'google' or 'openai'
- **LLM Model**: Choose between 'gpt-4-turbo-preview' or 'gemini-pro'
- **Audio Settings**: Adjust sample rate and chunk size

## API Endpoints

### Process Text Input
```
POST /api/process-text
Content-Type: application/json

{
  "text": "Hello, what's the weather like?",
  "user_id": "user123"
}
```

### Process Audio Input
```
POST /api/process-audio
Content-Type: multipart/form-data

file: <audio_file>
```

### Get Conversation History
```
GET /api/history/{user_id}
```

### Clear Conversation History
```
DELETE /api/history/{user_id}
```

## Usage

1. **Start speaking**: Click the "Start Listening" button to begin voice recording
2. **Stop recording**: Click "Stop Listening" when finished
3. **Or type**: Use the text input field to send messages
4. **Listen to response**: The assistant's response will be played as audio
5. **View history**: All messages are displayed in the chat window

## Technologies Used

### Backend
- **FastAPI**: Web framework
- **Google Cloud APIs**: Speech-to-Text and Text-to-Speech
- **OpenAI**: GPT models and Whisper
- **Python**: Programming language

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **CSS**: Styling
- **Axios**: HTTP client
- **React Icons**: Icon library

## System Requirements

- Python 3.8+
- Node.js 16+
- Modern web browser with microphone access
- Internet connection for API calls

## Troubleshooting

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure microphone is connected and working
- Try a different browser

### API Errors
- Verify API keys are correct in `.env`
- Check internet connection
- Ensure backend server is running

### Audio Issues
- Check audio output device settings
- Verify browser audio permissions
- Try different audio provider in `.env`

## Future Enhancements

- [ ] Voice activity detection (VAD)
- [ ] Real-time transcription streaming
- [ ] Multi-language support
- [ ] User authentication
- [ ] Database integration
- [ ] Advanced context management
- [ ] Custom instructions and personas
- [ ] Integration with external APIs

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository.

---

**Note**: This is a basic implementation. For production use, consider adding authentication, error handling, rate limiting, and proper logging.
