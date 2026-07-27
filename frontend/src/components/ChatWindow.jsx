import { useEffect, useRef } from 'react'
import './ChatWindow.css'

export default function ChatWindow({ messages, loading }) {
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation! 🗣️</p>
            <p>Use voice or text input to begin</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.audio && (
                  <audio controls className="message-audio">
                    <source src={`data:audio/mp3;base64,${msg.audio}`} type="audio/mp3" />
                  </audio>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}
