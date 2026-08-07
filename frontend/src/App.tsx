import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  Bell, 
  Mic, 
  Send, 
  Code, 
  CheckCircle2 
} from 'lucide-react';
import './App.css';

// Types & Interfaces
interface ChatHistoryItem {
  id: string;
  title: string;
  active?: boolean;
}

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

  // Sample Sidebar Data
  const recentChats: ChatHistoryItem[] = [
    { id: '1', title: 'Open Chrome', active: true },
    { id: '2', title: 'Create Folder' },
    { id: '3', title: 'Open VS Code' },
    { id: '4', title: 'Play Music' },
    { id: '5', title: 'Shutdown PC' },
    { id: '6', title: 'Tell me a joke' },
    { id: '7', title: 'Weather today' },
  ];

  const yesterdayChats: ChatHistoryItem[] = [
    { id: '8', title: 'Search File' },
    { id: '9', title: 'Calculator' },
    { id: '10', title: 'Latest News' },
  ];

  // Sample Chat Messages Data
  const [messages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello! How can I assist you today?',
      time: '10:30 AM',
      type: 'text',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Open Chrome',
      time: '10:30 AM',
      type: 'text',
    },
    {
      id: 'm3',
      sender: 'bot',
      text: 'Sure! I will open Chrome for you.',
      time: '10:30 AM',
      type: 'text',
    },
    {
      id: 'm4',
      sender: 'bot',
      type: 'status',
      statusDetails: {
        title: 'Executing Command...',
        description: 'Opening Google Chrome',
      },
    },
    {
      id: 'm5',
      sender: 'bot',
      type: 'typing',
    },
  ]);

  const handleSend = (): void => {
    if (!inputValue.trim()) return;
    // Handle message sending logic here
    setInputValue('');
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
        {/* Left Sidebar */}
        <aside className="sidebar">
          <button className="btn-new-chat">
            <Plus size={16} />
            <span>New Chat</span>
          </button>

          <div className="chat-section-title">RECENT CHATS</div>
          <div className="chat-list">
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.active ? 'active' : ''}`}
              >
                <MessageSquare size={16} />
                <span>{chat.title}</span>
                {chat.active && <div className="chat-item-indicator" />}
              </div>
            ))}
          </div>

          <div className="chat-section-title" style={{ marginTop: '10px' }}>
            YESTERDAY
          </div>
          <div className="chat-list">
            {yesterdayChats.map((chat) => (
              <div key={chat.id} className="chat-item">
                <MessageSquare size={16} />
                <span>{chat.title}</span>
              </div>
            ))}
          </div>

          <div className="profile-card">
            <div className="profile-avatar">
              <Bot size={20} />
            </div>
            <div className="profile-info">
              <span className="profile-name">ZIVO AI</span>
              <span className="profile-version">v1.0.0</span>
            </div>
          </div>
        </aside>

        {/* Chat Main Window */}
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