import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(input: string) {
    if (!input.trim() || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setStreaming("");
    setLoading(true);

    const unlistenToken = await listen<string>("token", (event) => {
      setStreaming((prev) => prev + event.payload);
    });

    const unlistenEnd = await listen<string>("token_end", (event) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: event.payload,
        },
      ]);

      setStreaming("");
      setLoading(false);

      unlistenToken();
      unlistenEnd();
    });

    try {
      await invoke("chat", {
        messages: updatedMessages,
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: " + String(err),
        },
      ]);

      setStreaming("");
      setLoading(false);

      unlistenToken();
      unlistenEnd();
    }
  }

  return (
    <main className="container">
      <h1>Luma</h1>

      <ChatWindow messages={messages} streaming={streaming} />

      <ChatInput onSend={sendMessage} loading={loading} />
    </main>
  );
}

export default App;