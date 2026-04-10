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

    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: input },
    ];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await invoke<string>("chat", {
        messages: updatedMessages,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: res },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Error: " + String(err),
        },
      ]);
    }

    setLoading(false);
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