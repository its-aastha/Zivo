import { type FormEvent, useRef, useState } from "react";
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
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState<string | CodeResponse>("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    if (!text || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const runCommand = async (value: string) => {
    const cleanedCommand = value.trim();

    if (!cleanedCommand || isProcessing) return;

    setCommand("");
    setResponse("");
    setIsProcessing(true);

    try {
      const data = await sendCommand(cleanedCommand);
      const result = data.response;

      if (
        result &&
        typeof result === "object" &&
        result.type === "code"
      ) {
        setResponse(result as CodeResponse);

        const message = result.success
          ? "Done. The code was executed successfully."
          : "There was an error while executing the code.";

        speak(message);
      } else {
        const message =
          typeof result === "string"
            ? result
            : JSON.stringify(result);

        setResponse(message);
        speak(message);
      }
    } catch (error) {
      console.error("ZIVO COMMAND ERROR:", error);
      setResponse(
        "I couldn't connect to Zivo. Please check that the backend is running."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runCommand(command);
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

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setResponse("Listening for your command...");
    };

    recognition.onresult = (event: any) => {
      const spokenCommand = event.results[0][0].transcript.trim();

      setIsListening(false);
      setCommand(spokenCommand);

      if (spokenCommand) {
        void runCommand(spokenCommand);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("SPEECH ERROR:", event.error);
      setIsListening(false);

      if (event.error === "not-allowed") {
        setResponse("Please allow microphone access for Zivo.");
      } else if (event.error === "no-speech") {
        setResponse("I didn't hear a command.");
      } else if (event.error !== "aborted") {
        setResponse("I couldn't hear your command. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("MIC START ERROR:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setResponse("Listening stopped.");
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const openCode = async (fileId: string) => {
    try {
      const result = await fetch(
        `http://127.0.0.1:8000/code/${fileId}`
      );

      if (!result.ok) throw new Error("Unable to open code.");

      const data = await result.json();

      const codeWindow = window.open("", "_blank");

      if (codeWindow) {
        codeWindow.document.write(`
          <html>
            <head>
              <title>${data.filename || "Generated Code"}</title>
              <style>
                body {
                  margin: 0;
                  padding: 24px;
                  background: #202018;
                  color: #f8f5df;
                  font-family: Consolas, monospace;
                }
                pre {
                  white-space: pre-wrap;
                  line-height: 1.6;
                }
              </style>
            </head>
            <body>
              <h2>${data.filename || "Generated Code"}</h2>
              <pre>${escapeHtml(data.code || "")}</pre>
            </body>
          </html>
        `);
        codeWindow.document.close();
      }
    } catch (error) {
      console.error("OPEN CODE ERROR:", error);
      setResponse("Could not open the generated code.");
    }
  };

  const downloadCode = (fileId: string) => {
    const link = document.createElement("a");
    link.href = `http://127.0.0.1:8000/code/${fileId}/download`;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderResponse = () => {
    if (
      typeof response === "object" &&
      response.type === "code"
    ) {
      return (
        <div className="code-result">
          <div>
            <span className="result-label">
              {response.language.toUpperCase()}
            </span>
            <h3>{response.filename}</h3>
          </div>

          <p>
            {response.success
              ? response.output || "Code executed successfully."
              : response.output || "Code execution failed."}
          </p>

          <div className="result-actions">
            <button onClick={() => openCode(response.file_id)}>
              Open code
            </button>
            <button onClick={() => downloadCode(response.file_id)}>
              Download
            </button>
          </div>
        </div>
      );
    }

    return <p className="response-copy">{String(response)}</p>;
  };

  return (
    <div className="zivo-page">
      <div className="browser-shell">
        <div className="browser-bar">
          <div className="traffic-lights" aria-hidden="true">
            <span className="traffic red" />
            <span className="traffic yellow" />
            <span className="traffic green" />
          </div>
        </div>

        <header className="topbar">
          <div className="brand">zivo.</div>

          <nav className="navigation">
            <a href="#simple">simple</a>
            <a href="#helpful">helpful</a>
            <a href="#yours">yours</a>
          </nav>

          <div className="top-note">
            good idea
            <br />
            better days
          </div>
        </header>

        <main className="main-layout">
          <section className="intro-panel">
            <div className="intro-copy">
              <h1>zivo</h1>
              <p>
                your voice.
                <br />
                your assistant.
              </p>

              <div className="curved-arrow" aria-hidden="true">
                ↗
              </div>
            </div>

            <div className="flower-note">
              smarter
              <br />
              things
              <br />
              together
              <br />
              :)
            </div>

            <div className="mic-section">
              <button
                className={`mic-button ${
                  isListening ? "is-listening" : ""
                }`}
                onClick={toggleMic}
                disabled={isProcessing}
                aria-label={
                  isListening ? "Stop listening" : "Start listening"
                }
              >
                <span className="mic-ring">
                  <svg
                    viewBox="0 0 64 64"
                    className="mic-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <rect
                      x="23"
                      y="8"
                      width="18"
                      height="32"
                      rx="9"
                    />
                    <path d="M15 29a17 17 0 0 0 34 0" />
                    <path d="M32 46v10" />
                    <path d="M23 56h18" />
                  </svg>
                </span>
              </button>

              <p className="mic-caption">
                {isListening
                  ? "listening..."
                  : "click the mic"}
                <br />
                {isListening
                  ? "say your command"
                  : "and say your command"}
              </p>
            </div>

            <div className="bottom-blob">
              <span>ideas</span>
              <span>commands</span>
              <span>a brighter you</span>
              <i />
            </div>
          </section>

          <section className="workspace-panel">
            <div className="workspace-card" id="helpful">
              <div className="workspace-header">
                <strong>zivo <span>✦</span></strong>
                <span>here to help!</span>
              </div>

              <div className="workspace-content">
                {response ? (
                  renderResponse()
                ) : (
                  <>
                    <div className="spark">⌁</div>
                    <p className="placeholder">
                      Your response will appear here...
                    </p>

                    <ul>
                      <li>Answers</li>
                      <li>Actions</li>
                      <li>Code</li>
                      <li>Files</li>
                      <li>Anything you need</li>
                    </ul>
                  </>
                )}

                <div className="workspace-sticker">
                  small commands
                  <br />
                  big possibilities
                  <br />
                  ♥
                </div>
              </div>
            </div>

            <form className="command-form" onSubmit={submitCommand}>
              <button
                type="button"
                className="attach-button"
                aria-label="Attach file"
              >
                ⌕
              </button>

              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Type a command..."
                disabled={isProcessing}
              />

              <button
                type="submit"
                className="send-button"
                disabled={isProcessing || !command.trim()}
                aria-label="Send command"
              >
                ↑
              </button>
            </form>

            <p className="footer-note">
              let's build a smarter you.
              <span />
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default App;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
