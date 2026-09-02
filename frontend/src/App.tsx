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
  const continuousModeRef = useRef(false);
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
  // START COMMAND LISTENING
  // ==========================================

  const startCommandListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      continuousModeRef.current = false;
      setIsZivoActive(false);
      return;
    }

    const commandRecognition = new SpeechRecognition();

    commandRecognition.lang = "en-US";
    commandRecognition.continuous = false;
    commandRecognition.interimResults = false;

    recognitionRef.current = commandRecognition;

    commandRecognition.onstart = () => {
      if (isSpeakingRef.current) {
        commandRecognition.stop();
        return;
      }

      setIsListening(true);
      setResponse("I'm listening...");
    };

    commandRecognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript
        .trim();

      console.log("USER COMMAND:", command);

      setIsListening(false);

      if (!command) {
        setResponse("I didn't hear a command.");

        if (continuousModeRef.current) {
          window.setTimeout(() => {
            startCommandListening();
          }, 350);
        }

        return;
      }

      // ========================================
      // SLEEP COMMANDS
      // ========================================

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
        continuousModeRef.current = false;
        wakeTriggeredRef.current = false;

        setIsProcessing(false);
        setIsListening(false);
        setIsZivoActive(false);
        setResponse("Okay, I'm going to sleep.");

        recognitionRef.current?.stop();
        speak("Okay, I'm going to sleep.");

        return;
      }

      // Send the actual command to the existing Zivo backend.
      await handleCommand(command);

      // ========================================
      // PHASE 3: LISTEN FOR THE NEXT COMMAND
      // ========================================

      if (continuousModeRef.current) {
        setIsZivoActive(true);

        // Give the user a small pause after the backend response
        // before opening the microphone again.
        window.setTimeout(() => {
          if (continuousModeRef.current) {
            startCommandListening();
          }
        }, 500);
      }
    };

    commandRecognition.onerror = (event: any) => {
      console.error("COMMAND SPEECH ERROR:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        continuousModeRef.current = false;
        setIsZivoActive(false);

        setResponse(
          "Please allow microphone access for ZIVO."
        );
      } else if (event.error === "no-speech") {
        setResponse("I didn't hear a command.");

        // Stay awake and listen again.
        if (continuousModeRef.current) {
          window.setTimeout(() => {
            if (continuousModeRef.current) {
              startCommandListening();
            }
          }, 500);
        }
      } else {
        setResponse(
          "I couldn't hear your command. Please try again."
        );

        if (continuousModeRef.current) {
          window.setTimeout(() => {
            if (continuousModeRef.current) {
              startCommandListening();
            }
          }, 500);
        }
      }
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

      if (continuousModeRef.current) {
        window.setTimeout(() => {
          if (continuousModeRef.current) {
            startCommandListening();
          }
        }, 500);
      }
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

    // Stop an existing recognition session first.
    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    // Keep listening because we are waiting for "Buddy".
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
        // PHASE 2 WAKE WORD
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
          continuousModeRef.current = true;
          setIsZivoActive(true);
          setResponse("Yes, I'm awake. What can I do for you?");
          speak("Yes, I'm awake. What can I do for you?");

          // Stop wake-word recognition.
          // The onend event below will start command listening.
          recognition.stop();

          return;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error(
        "WAKE WORD SPEECH ERROR:",
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

      // If Buddy woke Zivo, immediately switch to
      // listening for the actual user command.
      if (wakeTriggeredRef.current) {
        // Small delay prevents Chrome from rejecting
        // a new recognition session immediately after stop().
        const waitForSpeech = () => {
          if (!wakeTriggeredRef.current) {
            return;
          }

          if (isSpeakingRef.current) {
            window.setTimeout(waitForSpeech, 150);
            return;
          }

          startCommandListening();
        };

        window.setTimeout(waitForSpeech, 150);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "START WAKE LISTENING ERROR:",
        error
      );
    }
  };


  // ==========================================
  // PUT ZIVO BACK TO SLEEP
  // ==========================================

  const sleepZivo = () => {
    wakeTriggeredRef.current = false;
    continuousModeRef.current = false;
    recognitionRef.current?.stop();

    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;

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
