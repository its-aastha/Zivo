import { useRef, useState } from "react";
import "./App.css";
import { sendCommand } from "./api";

interface CodeResponse {
  type: "code";
  language: string;
  filename: string;
  file_id: string;
  success: boolean;
  output?: string;
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [response, setResponse] = useState<string | CodeResponse>("");

  const [openedCode, setOpenedCode] = useState("");
  const [openedFilename, setOpenedFilename] = useState("");

  const recognitionRef = useRef<any>(null);

  // ==========================================
  // HANDLE COMMAND
  // ==========================================

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    setResponse("");
    setOpenedCode("");
    setOpenedFilename("");

    try {
      const data = await sendCommand(command);

      const result = data.response;

      // Code response from backend
      if (
        result &&
        typeof result === "object" &&
        result.type === "code"
      ) {
        setResponse(result as CodeResponse);
      } else {
        // Normal text response
        setResponse(
          typeof result === "string"
            ? result
            : JSON.stringify(result)
        );
      }
    } catch (error) {
      console.error("ZIVO ERROR:", error);

      setResponse("I couldn't connect to ZIVO.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // OPEN GENERATED CODE
  // ==========================================

  const openCode = async (
    fileId: string,
    filename: string
  ) => {
    try {
      const result = await fetch(
        `http://127.0.0.1:8000/code/${fileId}`
      );

      if (!result.ok) {
        throw new Error(
          "Could not load generated code."
        );
      }

      const data = await result.json();

      setOpenedCode(data.code);
      setOpenedFilename(
        data.filename || filename
      );
    } catch (error) {
      console.error(
        "OPEN CODE ERROR:",
        error
      );

      alert(
        "Could not open the generated code."
      );
    }
  };

  // ==========================================
  // DOWNLOAD GENERATED CODE
  // ==========================================

  const downloadCode = (fileId: string) => {
    const downloadUrl =
      `http://127.0.0.1:8000/code/${fileId}/download`;

    const link =
      document.createElement("a");

    link.href = downloadUrl;
    link.setAttribute("download", "");

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ==========================================
  // CLOSE CODE VIEWER
  // ==========================================

  const closeCode = () => {
    setOpenedCode("");
    setOpenedFilename("");
  };

  // ==========================================
  // START LISTENING
  // ==========================================

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

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current =
      recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setResponse("");
    };

    recognition.onresult = async (
      event: any
    ) => {
      const command =
        event.results[0][0].transcript;

      console.log(
        "USER SAID:",
        command
      );

      setIsListening(false);

      await handleCommand(command);
    };

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech error:",
        event.error
      );

      setIsListening(false);

      if (
        event.error === "not-allowed"
      ) {
        setResponse(
          "Please allow microphone access."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // ==========================================
  // STOP LISTENING
  // ==========================================

  const stopListening = () => {
    recognitionRef.current?.stop();

    setIsListening(false);
  };

  // ==========================================
  // TOGGLE LISTENING
  // ==========================================

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ==========================================
  // RENDER RESPONSE
  // ==========================================

  const renderResponse = () => {
    // ========================================
    // CODE FILE CARD
    // ========================================

    if (
      typeof response === "object" &&
      response.type === "code"
    ) {
      return (
        <div className="code-file-card">

          {/* HEADER */}

          <div className="code-file-header">

            <div className="code-file-info">

              <div className="code-file-language">
                {response.language.toUpperCase()}
              </div>

              <div className="code-file-name">
                {response.filename}
              </div>

            </div>

            <div
              className={
                response.success
                  ? "code-status code-success"
                  : "code-status code-error"
              }
            >
              {response.success
                ? "Ready"
                : "Error"}
            </div>

          </div>

          {/* OUTPUT */}

          <div className="code-file-output">

            {response.success
              ? `Output: ${
                  response.output ||
                  "No output"
                }`
              : `Execution Error: ${
                  response.output ||
                  "Unknown error"
                }`}

          </div>

          {/* ACTION BUTTONS */}

          <div className="code-file-actions">

            <button
              className="code-open-button"
              onClick={() =>
                openCode(
                  response.file_id,
                  response.filename
                )
              }
            >
              Open Code
            </button>

            <button
              className="code-download-button"
              onClick={() =>
                downloadCode(
                  response.file_id
                )
              }
            >
              Download
            </button>

          </div>

        </div>
      );
    }

    // ========================================
    // NORMAL TEXT RESPONSE
    // ========================================

    return (
      <div className="response-text">
        {String(response)}
      </div>
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="zivo-app">

      {/* ZIVO LOGO */}

      <div className="zivo-logo">
        zivo
        <span className="cursor">
          |
        </span>
      </div>

      {/* MAIN */}

      <main className="zivo-main">

        <h1 className="hero-title">
          Hi! How can{" "}
          <span>I help you?</span>
        </h1>

        {/* VOICE AREA */}

        <div
          className={`voice-area ${
            isListening
              ? "is-listening"
              : ""
          }`}
        >

          {/* WAVE ANIMATION */}

          {isListening && (
            <>
              <div className="wave wave-left"></div>

              <div className="wave wave-right"></div>

              <div className="voice-particles"></div>
            </>
          )}

          {/* MICROPHONE */}

          <button
            className={`mic-button ${
              isListening
                ? "mic-active"
                : ""
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
            {renderResponse()}
          </div>
        )}

      </main>

      {/* CODE VIEWER MODAL */}

      {openedCode && (
        <div className="code-modal-overlay">

          <div className="code-modal">

            {/* MODAL HEADER */}

            <div className="code-modal-header">

              <div className="code-modal-title">
                {openedFilename}
              </div>

              <button
                className="code-close-button"
                onClick={closeCode}
                aria-label="Close code viewer"
              >
                ×
              </button>

            </div>

            {/* CODE */}

            <pre className="code-modal-content">
              <code>
                {openedCode}
              </code>
            </pre>

            {/* MODAL FOOTER */}

            <div className="code-modal-footer">

              <button
                className="code-modal-copy"
                onClick={() =>
                  navigator.clipboard.writeText(
                    openedCode
                  )
                }
              >
                Copy Code
              </button>

              <button
                className="code-modal-download"
                onClick={() => {

                  const codeBlob =
                    new Blob(
                      [openedCode],
                      {
                        type:
                          "text/plain"
                      }
                    );

                  const url =
                    URL.createObjectURL(
                      codeBlob
                    );

                  const link =
                    document.createElement(
                      "a"
                    );

                  link.href = url;

                  link.download =
                    openedFilename;

                  document.body.appendChild(
                    link
                  );

                  link.click();

                  document.body.removeChild(
                    link
                  );

                  URL.revokeObjectURL(
                    url
                  );
                }}
              >
                Download
              </button>

            </div>

          </div>

        </div>
      )}

      {/* FOOTER */}

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