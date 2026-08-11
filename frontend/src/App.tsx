import { useRef, useState } from "react";
import "./App.css";
import { sendCommand } from "./api";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");

  const recognitionRef = useRef<any>(null);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    setResponse("");

    try {
      const data = await sendCommand(command);

      setResponse(
        typeof data.response === "string"
          ? data.response
          : JSON.stringify(data.response)
      );
    } catch (error) {
      console.error("ZIVO ERROR:", error);
      setResponse("I couldn't connect to ZIVO.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setResponse("");
    };

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript;

      console.log("USER SAID:", command);

      setIsListening(false);

      await handleCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);

      if (event.error === "not-allowed") {
        setResponse("Please allow microphone access.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="zivo-app">

      {/* ZIVO LOGO */}
      <div className="zivo-logo">
        zivo<span className="cursor">|</span>
      </div>

      {/* MAIN */}
      <main className="zivo-main">

        <h1 className="hero-title">
          Hi! How can <span>I help you?</span>
        </h1>

        {/* VOICE AREA */}
        <div
          className={`voice-area ${
            isListening ? "is-listening" : ""
          }`}
        >

          {/* Wave animation appears ONLY when listening */}
          {isListening && (
            <>
              <div className="wave wave-left"></div>
              <div className="wave wave-right"></div>

              <div className="voice-particles"></div>
            </>
          )}

          {/* Microphone */}
          <button
            className={`mic-button ${
              isListening ? "mic-active" : ""
            }`}
            onClick={toggleListening}
            disabled={isProcessing}
            aria-label="Voice assistant"
          >
            <svg
              viewBox="0 0 24 24"
              className="mic-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="8"
                y="3"
                width="8"
                height="12"
                rx="4"
              />

              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
              <path d="M8 21h8" />
            </svg>
          </button>
        </div>

        {/* STATUS */}
        <div className="voice-status">
          {isListening
            ? "Listening..."
            : isProcessing
            ? "ZIVO is thinking..."
            : "Click to start listening"}
        </div>

        {/* RESPONSE */}
        {response && (
          <div className="zivo-response">
            {response}
          </div>
        )}

      </main>

      <footer>
        ZIVO · Your Voice. Your Assistant.
      </footer>

    </div>
  );
}

export default App;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}