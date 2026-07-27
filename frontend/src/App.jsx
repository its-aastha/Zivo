import { useState, useRef } from 'react'
import './App.css'
import VoiceInput from './components/VoiceInput'
import ChatWindow from './components/ChatWindow'
import TextInput from './components/TextInput'

function App() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const handleVoiceInput = async (audioData) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', audioData)
      
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setMessages([...messages, 
        { role: 'user', content: data.response_text, timestamp: new Date() },
        { role: 'assistant', content: data.response_text, audio: data.audio_url, timestamp: new Date() }
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTextInput = async (text) => {
    setLoading(true)
    setMessages([...messages, { role: 'user', content: text, timestamp: new Date() }])
    
    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      const data = await response.json()
      setMessages(prev => [...prev, 
        { role: 'assistant', content: data.response_text, audio: data.audio_url, timestamp: new Date() }
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎤 Voice Assistant</h1>
        <p>AI-powered voice-based assistant</p>
      </header>
      
      <main className="app-main">
        <ChatWindow messages={messages} loading={loading} />
        
        <div className="input-section">
          <VoiceInput 
            onVoiceInput={handleVoiceInput} 
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <TextInput onTextInput={handleTextInput} disabled={loading} />
        </div>
      </main>
    </div>
  )
}

export default App
