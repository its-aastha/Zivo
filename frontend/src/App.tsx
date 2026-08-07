import React, { useEffect, useRef, useState } from 'react';
import { 
  Bot, 
  User, 
  Bell, 
  Mic, 
  Send, 
  Code, 
  CheckCircle2 
} from 'lucide-react';
import './App.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  time?: string;
  type?: 'text' | 'status' | 'typing';
  statusDetails?: {
    title: string;
    description: string;
  };
}

export const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello! How can I assist you today?',
      time: '10:30 AM',
      type: 'text',
    },
  ]);

  const nowTime = (): string =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const handleSend = async (): Promise<void> => {
    const text = inputValue.trim();
    if (!text || isSending) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text,
      time: nowTime(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
      const response = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: { response?: string } = await response.json();
      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text: data.response ?? 'No response from server.',
        time: nowTime(),
        type: 'text',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        sender: 'bot',
        text:
          error instanceof Error
            ? `Unable to reach backend: ${error.message}`
            : 'Unable to reach backend.',
        time: nowTime(),
        type: 'text',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="app-window">
      {/* Top Header */}
      <header className="window-header">
        <div className="window-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <div className="logo-container">
          <span className="logo-text">ZIVO</span>
        </div>
        <div className="header-actions">
          <Bell className="header-icon" size={18} />
          <div className="avatar-header">
            <Bot size={18} color="#00e5ff" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="app-body">
        <main className="chat-area">
          <div className="messages-container">
            {messages.map((msg) => {
              if (msg.type === 'status' && msg.statusDetails) {
                return (
                  <div key={msg.id} className="status-card">
                    <div className="status-icon">
                      <Code size={18} />
                    </div>
                    <div className="status-info">
                      <span className="status-title">{msg.statusDetails.title}</span>
                      <span className="status-desc">{msg.statusDetails.description}</span>
                    </div>
                    <div className="status-check">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                );
              }

              if (msg.type === 'typing') {
                return (
                  <div key={msg.id} className="message-row msg-row bot">
                    <div className="msg-avatar bot">
                      <Bot size={20} />
                    </div>
                    <div className="msg-content">
                      <div className="bubble typing-bubble">
                        <span>ZIVO is typing</span>
                        <div className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`message-row msg-row ${msg.sender}`}
                >
                  <div className={`msg-avatar ${msg.sender}`}>
                    {msg.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="msg-content">
                    <div className="bubble">{msg.text}</div>
                    {msg.time && <div className="msg-time">{msg.time}</div>}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="message-row msg-row bot">
                <div className="msg-avatar bot">
                  <Bot size={20} />
                </div>
                <div className="msg-content">
                  <div className="bubble typing-bubble">
                    <span>ZIVO is typing</span>
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomAnchorRef} />
          </div>

          {/* Input Panel */}
          <div className="input-container">
            <button className="mic-btn" type="button">
              <Mic size={18} />
            </button>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask ZIVO anything..."
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSend} type="button">
              <Send size={18} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;