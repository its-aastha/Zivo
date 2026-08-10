import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  User,
  Mic,
  Send,
  Code,
  CheckCircle2,
} from "lucide-react";

import "./App.css";

interface Message {
  id: string;
  sender: "bot" | "user";
  text?: string;
  time?: string;
  type?: "text" | "status" | "typing";
  statusDetails?: {
    title: string;
    description: string;
  };
}

function App(): React.ReactElement {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "bot",
      text: "Hello! How can I assist you today?",
      time: "10:30 AM",
      type: "text",
    },
  ]);

  const nowTime = (): string =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending]);

  // ==============================
  // ZIVO SPEAKS
  // ==============================

  const speak = (text: string) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // ==============================
  // SEND COMMAND TO BACKEND
  // ==============================

  const sendCommand = async (command: string) => {
    command = command.trim();

    if (!command || isSending) return;

    // Add user message
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      sender: "user",
      text: command,
      time: nowTime(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);

    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/command",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: command,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("ZIVO RESPONSE:", data);

      const botResponse =
        data.response || "I could not understand that.";

      // Add ZIVO message
      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        text: botResponse,
        time: nowTime(),
        type: "text",
      };

      setMessages((prev) => [...prev, botMessage]);

      // ZIVO speaks
      speak(botResponse);

    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        sender: "bot",
        text:
          error instanceof Error
            ? error.message
            : "Unable to connect to ZIVO backend.",
        time: nowTime(),
        type: "text",
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsSending(false);
    }
  };

  // ==============================
  // VOICE COMMAND
  // ==============================

  const startListening = () => {
    if (isSending || isListening) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    // Only listen for one command
    recognition.continuous = false;

    // Don't show partial results
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("🎤 ZIVO listening...");
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[0][0].transcript;

      console.log("🎤 User said:", transcript);

      // Show recognized text
      setInputValue(transcript);

      // Send command to ZIVO
      sendCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🎤 ZIVO stopped listening");
      setIsListening(false);
    };

    recognition.start();
  };

  // ==============================
  // ENTER KEY
  // ==============================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      sendCommand(inputValue);
    }
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="top-header">
        <div className="logo">
          ZIVO
        </div>
      </header>

      {/* CHAT */}

      <div className="app-body">

        <main className="chat-area">

          <div className="messages-container">

            {messages.map((msg) => {

              // STATUS CARD

              if (
                msg.type === "status" &&
                msg.statusDetails
              ) {
                return (
                  <div
                    key={msg.id}
                    className="status-card"
                  >
                    <div className="status-icon">
                      <Code size={18} />
                    </div>

                    <div className="status-info">
                      <span className="status-title">
                        {msg.statusDetails.title}
                      </span>

                      <span className="status-desc">
                        {msg.statusDetails.description}
                      </span>
                    </div>

                    <div className="status-check">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                );
              }

              // NORMAL MESSAGE

              return (
                <div
                  key={msg.id}
                  className={`message-row msg-row ${msg.sender}`}
                >
                  <div
                    className={`msg-avatar ${msg.sender}`}
                  >
                    {msg.sender === "bot" ? (
                      <Bot size={20} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>

                  <div className="msg-content">

                    <div className="bubble">
                      {msg.text}
                    </div>

                    {msg.time && (
                      <div className="msg-time">
                        {msg.time}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* THINKING */}

            {isSending && (
              <div className="message-row msg-row bot">

                <div className="msg-avatar bot">
                  <Bot size={20} />
                </div>

                <div className="msg-content">

                  <div className="bubble typing-bubble">
                    <span>
                      ZIVO is thinking...
                    </span>

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

          {/* INPUT */}

          <div className="input-container">

            {/* MIC BUTTON */}

            <button
              className={`mic-btn ${
                isListening ? "listening" : ""
              }`}
              type="button"
              onClick={startListening}
              disabled={isSending}
            >
              <Mic size={18} />
            </button>

            {/* TEXT INPUT */}

            <input
              type="text"
              className="chat-input"
              placeholder={
                isListening
                  ? "Listening..."
                  : "Ask ZIVO anything..."
              }
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={isListening}
            />

            {/* SEND */}

            <button
              className="send-btn"
              onClick={() =>
                sendCommand(inputValue)
              }
              type="button"
              disabled={
                isSending ||
                !inputValue.trim()
              }
            >
              <Send size={18} />
            </button>

          </div>

        </main>

      </div>
    </div>
  );
}

export default App;