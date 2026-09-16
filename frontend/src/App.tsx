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

  // Stores the current speech recognition session.
  const recognitionRef = useRef<any>(null);

  // Prevents Zivo from speaking and listening at
  // the same time.
  const isSpeakingRef = useRef(false);


  // ==========================================
  // TEXT TO SPEECH
  // ==========================================

  const speak = (text: string) => {
    if (!text || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };


  // ==========================================
  // HANDLE COMMAND
  // ==========================================

  const handleCommand = async (command: string): Promise<void> => {
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

        if (result.success) {
          speak(
            result.output
              ? `Done. ${result.output}`
              : "Done. The code was executed successfully."
          );
        } else {
          speak(
            result.output
              ? `There was an error. ${result.output}`
              : "There was an error while executing the code."
          );
        }
      } else {
        const spokenResponse =
          typeof result === "string"
            ? result
            : JSON.stringify(result);

        setResponse(spokenResponse);
        speak(spokenResponse);
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
  // START ONE-TIME COMMAND LISTENING
  // ==========================================
  // The user must click the mic button to start.
  //
  // Zivo listens for ONE command only.
  // After receiving the command, listening stops.
  //
  // No wake word.
  // No continuous listening.
  // No automatic restart.

  const startCommandListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    // Stop any previous recognition session.
    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    // Listen for only one command.
    recognition.continuous = false;

    // Return only the final recognized sentence.
    recognition.interimResults = false;

    recognitionRef.current = recognition;


    // ========================================
    // RECOGNITION STARTED
    // ========================================

    recognition.onstart = () => {
      // Do not start listening while Zivo is speaking.
      if (isSpeakingRef.current) {
        recognition.stop();
        return;
      }

      setIsListening(true);
      setResponse("I'm listening...");
    };


    // ========================================
    // COMMAND RECEIVED
    // ========================================

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript
        .trim();

      console.log("USER COMMAND:", command);

      // Stop the listening indicator immediately.
      setIsListening(false);

      if (!command) {
        setResponse("I didn't hear a command.");
        return;
      }

      // ========================================
      // SLEEP COMMANDS
      // ========================================
      // These are kept for compatibility with
      // your existing Zivo behavior.

      const normalizedCommand = command
        .toLowerCase()
        .replace(/[.,!?]/g, "")
        .trim();

      const sleepCommand =
        normalizedCommand === "sleep" ||
        normalizedCommand === "go to sleep" ||
        normalizedCommand === "go to sleep zivo" ||
        normalizedCommand === "stop listening" ||
        normalizedCommand === "stop listening zivo" ||
        normalizedCommand === "goodbye" ||
        normalizedCommand === "bye";

      if (sleepCommand) {
        recognitionRef.current?.stop();

        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;

        setIsListening(false);
        setIsProcessing(false);
        setResponse("Okay, I'm going to sleep.");

        speak("Okay, I'm going to sleep.");

        return;
      }

      // Send the recognized command to the backend.
      await handleCommand(command);

      // Listening does NOT restart automatically.
      // The user must click the mic again.
    };


    // ========================================
    // SPEECH RECOGNITION ERROR
    // ========================================

    recognition.onerror = (event: any) => {
      console.error(
        "COMMAND SPEECH ERROR:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        setResponse(
          "Please allow microphone access for ZIVO."
        );
      } else if (event.error === "no-speech") {
        setResponse("I didn't hear a command.");
      } else if (event.error === "aborted") {
        // The user stopped listening manually.
        // No error message is needed.
      } else {
        setResponse(
          "I couldn't hear your command. Please try again."
        );
      }
    };


    // ========================================
    // RECOGNITION ENDED
    // ========================================
    // This only updates the UI.
    // It does NOT start listening again.

    recognition.onend = () => {
      setIsListening(false);
    };


    // ========================================
    // START MICROPHONE
    // ========================================

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "START COMMAND LISTENING ERROR:",
        error
      );

      setIsListening(false);
    }
  };


  // ==========================================
  // STOP COMMAND LISTENING
  // ==========================================
  // Called when the user clicks the mic while
  // Zivo is already listening.

  const stopCommandListening = () => {
    recognitionRef.current?.stop();

    setIsListening(false);
    setResponse("Listening stopped.");
  };


  // ==========================================
  // TOGGLE MICROPHONE
  // ==========================================
  // First click  → Start listening.
  // Second click → Stop listening.

  const toggleListening = () => {
    if (isListening) {
      stopCommandListening();
    } else {
      startCommandListening();
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
            isListening
              ? "is-listening"
              : ""
          }`}
        >
          {isListening && (
            <>
              <div className="wave wave-left"></div>
              <div className="wave wave-right"></div>
              <div className="voice-particles"></div>
            </>
          )}

          <button
            className={`mic-button ${
              isListening
                ? "mic-active"
                : ""
            }`}
            onClick={toggleListening}
            disabled={isProcessing}
            aria-label={
              isListening
                ? "Stop listening"
                : "Start listening"
            }
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
            : isListening
            ? "Listening for your command..."
            : "Click the mic and say your command"}
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


// ==========================================
// BROWSER SPEECH RECOGNITION TYPES
// ==========================================

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}