import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    // add user message immediately
    setMessages((prev) => [...prev, "you: " + userMsg]);

    setLoading(true);

    try {
      const res = await invoke<string>("chat", {
        message: userMsg,
      });

      setMessages((prev) => [...prev, "luma: " + res]);
    } catch (err) {
      setMessages((prev) => [...prev, "error: " + String(err)]);
    }

    setLoading(false);
  }

  return (
    <main className="container">
      <h1>Luma</h1>

      {/* Chat window */}
      <div style={{ height: 300, overflowY: "auto", border: "1px solid #333", padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>

      {/* Input */}
      <div className="row" style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Talk to Luma..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </main>
  );
}

export default App;