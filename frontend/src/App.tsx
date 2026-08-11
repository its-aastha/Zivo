import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");

  const recognitionRef = useRef<any>(null);

  // --------------------------------
  // SEND COMMAND TO FASTAPI
  // --------------------------------

  const sendCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8000/command", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          command: command,
        }),
      });

      if (!res.ok) {
        throw new Error("Backend request failed");
      }

      const data = await res.json();

      console.log("ZIVO RESPONSE:", data);

      setResponse(
        typeof data.response === "string"
          ? data.response
          : JSON.stringify(data.response)
      );

    } catch (error) {
      console.error("ZIVO ERROR:", error);

      setResponse(
        "Unable to connect to ZIVO backend."
      );
    }

    setIsProcessing(false);
  };


  // --------------------------------
  // START VOICE RECOGNITION
  // --------------------------------

  const startListening = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
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
      console.log("ZIVO LISTENING...");

      setIsListening(true);
      setResponse("");
    };


    recognition.onresult = async (event: any) => {

      const command =
        event.results[0][0].transcript;

      console.log("USER SAID:", command);

      setIsListening(false);

      await sendCommand(command);
    };


    recognition.onerror = (event: any) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };


    recognition.onend = () => {

      setIsListening(false);

      console.log("ZIVO STOPPED LISTENING");
    };


    recognition.start();
  };


  // --------------------------------
  // STOP LISTENING
  // --------------------------------

  const stopListening = () => {

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
  };


  // --------------------------------
  // MICROPHONE CLICK
  // --------------------------------

  const toggleListening = () => {

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };


  return (
    <div className="zivo-app">

      {/* HEADER */}

      <header className="zivo-header">

        <div className="header-button">
          ☰
        </div>

        <div className="zivo-logo">
          ZIVO
          <span></span>
        </div>

        <div className="header-button">
          ⚙
        </div>

      </header>


      {/* MAIN */}

      <main className="zivo-main">

        <div className="zivo-card">

          <h1>
            Hi! How can{" "}
            <span>I help you?</span>
          </h1>


          {/* VOICE AREA */}

          <div
            className={`voice-area ${
              isListening ? "listening" : ""
            }`}
          >

            {/* ANIMATION ONLY WHEN LISTENING */}

            {isListening && (
              <div className="wave-container">

                <div className="wave wave-left"></div>

                <div className="wave wave-right"></div>

                <div className="particles"></div>

              </div>
            )}


            {/* MICROPHONE */}

            <button
              className={`mic-button ${
                isListening ? "mic-active" : ""
              }`}
              onClick={toggleListening}
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

        </div>

      </main>


      {/* FOOTER */}

      <footer>
        ZIVO · Your Voice. Your Assistant.
      </footer>

    </div>
  );
}


export default App;


// --------------------------------
// TYPESCRIPT SUPPORT
// --------------------------------

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}