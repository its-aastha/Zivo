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
  const [isZivoActive, setIsZivoActive] = useState(false);

  const [response, setResponse] = useState<string | CodeResponse>("");

  const [openedCode, setOpenedCode] = useState("");
  const [openedFilename, setOpenedFilename] = useState("");

  const recognitionRef = useRef<any>(null);
  const wakeTriggeredRef = useRef(false);

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

      if (
        result &&
        typeof result === "object" &&
        result.type === "code"
      ) {
        setResponse(result as CodeResponse);
      } else {
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
        throw new Error("Could not load generated code.");
      }

      const data = await result.json();

      setOpenedCode(data.code);
      setOpenedFilename(data.filename || filename);
    } catch (error) {
      console.error("OPEN CODE ERROR:", error);
      alert("Could not open the generated code.");
    }
  };

  // ==========================================
  // DOWNLOAD GENERATED CODE
  // ==========================================

  const downloadCode = (fileId: string) => {
    const downloadUrl =
      `http://127.0.0.1:8000/code/${fileId}/download`;

    const link = document.createElement("a");

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
  // LISTEN FOR THE ACTUAL COMMAND
  // ==========================================

  const startCommandListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      setIsZivoActive(false);
      return;
    }

    const commandRecognition = new SpeechRecognition();

    commandRecognition.lang = "en-US";
    commandRecognition.continuous = false;
    commandRecognition.interimResults = false;

    recognitionRef.current = commandRecognition;

    commandRecognition.onstart = () => {
      setIsListening(true);
      setResponse("I'm listening...");
    };

    commandRecognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript.trim();

      console.log("USER COMMAND:", command);

      setIsListening(false);

      if (!command) {
        setResponse("I didn't hear a command.");
        setIsZivoActive(false);
        return;
      }

      await handleCommand(command);

      // Phase 2 uses one command at a time.
      // After the command is handled, Buddy goes back to sleep.
      setIsZivoActive(false);
    };

    commandRecognition.onerror = (event: any) => {
      console.error("COMMAND SPEECH ERROR:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        setResponse(
          "Please allow microphone access for ZIVO."
        );
      } else if (event.error === "no-speech") {
        setResponse("I didn't hear a command.");
      } else {
        setResponse(
          "I couldn't hear your command. Please try again."
        );
      }

      setIsZivoActive(false);
    };

    commandRecognition.onend = () => {
      setIsListening(false);
    };

    try {
      commandRecognition.start();
    } catch (error) {
      console.error(
        "START COMMAND LISTENING ERROR:",
        error
      );
      setIsListening(false);
      setIsZivoActive(false);
    }
  };

  // ==========================================
  // START WAKE-WORD LISTENING
  // ==========================================

  const startListening = () => {
    wakeTriggeredRef.current = false;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setResponse("");
    };

    recognition.onresult = (event: any) => {
      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        if (!event.results[i].isFinal) continue;

        const spokenText =
          event.results[i][0].transcript
            .trim()
            .toLowerCase();

        console.log(
          "WAKE LISTENER HEARD:",
          spokenText
        );

        // ========================================
        // PHASE 1 WAKE WORD: BUDDY
        // ========================================

        const wakeWordDetected =
          spokenText.includes("buddy") ||
          spokenText.includes("buddie") ||
          spokenText.includes("budi");

        if (wakeWordDetected) {
          console.log(
            "ZIVO WAKE WORD DETECTED"
          );

          wakeTriggeredRef.current = true;

          setIsZivoActive(true);
          setIsListening(false);
          setResponse(
            "Yes, I'm awake. What can I do for you?"
          );

          recognition.stop();
          return;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error(
        "WAKE SPEECH ERROR:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        setResponse(
          "Please allow microphone access for ZIVO."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      // IMPORTANT:
      // Use the ref instead of isZivoActive here.
      // React state may still contain the old value
      // when Chrome fires the onend event.
      if (wakeTriggeredRef.current) {
        window.setTimeout(() => {
          startCommandListening();
        }, 350);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "START LISTENING ERROR:",
        error
      );
    }
  };

  // ==========================================
  // PUT ZIVO BACK TO SLEEP
  // ==========================================

  const sleepZivo = () => {
    wakeTriggeredRef.current = false;
    recognitionRef.current?.stop();

    setIsListening(false);
    setIsZivoActive(false);
    setIsProcessing(false);
    setResponse("ZIVO is sleeping.");
  };

  // ==========================================
  // TOGGLE LISTENING
  // ==========================================

  const toggleListening = () => {
    if (isZivoActive || isListening) {
      sleepZivo();
    } else {
      startListening();
    }
  };

  // ==========================================
  // RENDER RESPONSE
  // ==========================================

  const renderResponse = () => {
    if (
      typeof response === "object" &&
      response.type === "code"
    ) {
      return (
        <div className="code-file-card">
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
              {response.success ? "Ready" : "Error"}
            </div>
          </div>

          <div className="code-file-output">
            {response.success
              ? `Output: ${response.output || "No output"}`
              : `Execution Error: ${
                  response.output || "Unknown error"
                }`}
          </div>

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
                downloadCode(response.file_id)
              }
            >
              Download
            </button>
          </div>
        </div>
      );
    }

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
      <div className="zivo-logo">
        zivo
        <span className="cursor">|</span>
      </div>

      <main className="zivo-main">
        <h1 className="hero-title">
          Hi! How can <span>I help you?</span>
        </h1>

        <div
          className={`voice-area ${
            isListening || isZivoActive
              ? "is-listening"
              : ""
          }`}
        >
          {(isListening || isZivoActive) && (
            <>
              <div className="wave wave-left"></div>
              <div className="wave wave-right"></div>
              <div className="voice-particles"></div>
            </>
          )}

          <button
            className={`mic-button ${
              isListening || isZivoActive
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

        <div className="voice-status">
          {isProcessing
            ? "ZIVO is thinking..."
            : isZivoActive && isListening
            ? "Listening for your command..."
            : isZivoActive
            ? "ZIVO is active"
            : isListening
            ? 'Listening for "Buddy"...'
            : 'Click the mic and say "Buddy"'}
        </div>

        {response && (
          <div className="zivo-response">
            {renderResponse()}
          </div>
        )}
      </main>

      {openedCode && (
        <div className="code-modal-overlay">
          <div className="code-modal">
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

            <pre className="code-modal-content">
              <code>{openedCode}</code>
            </pre>

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
                  const codeBlob = new Blob(
                    [openedCode],
                    { type: "text/plain" }
                  );

                  const url =
                    URL.createObjectURL(codeBlob);

                  const link =
                    document.createElement("a");

                  link.href = url;
                  link.download = openedFilename;

                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

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
