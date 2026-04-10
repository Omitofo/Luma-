import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(input: string) {
    if (!input.trim()) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await invoke<string>("chat", {
        messages: updatedMessages,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: " + String(err),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Luma</h1>

      <ChatWindow messages={messages} />

      <ChatInput onSend={sendMessage} loading={loading} />
    </main>
  );
}

export default App;