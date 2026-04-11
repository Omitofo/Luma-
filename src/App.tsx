import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import ChatWindow from "./components/chat/ChatWindow";
import ChatInput from "./components/chat/ChatInput";
import Onboarding from "./components/Onboarding";
import Settings from "./components/Settings";

import type { Message } from "./types/chat";
import type { LearnerProfile, TutorMode } from "./types/tutor";

type AppState = "onboarding" | "chat";

function App() {
  const [state, setState] = useState<AppState>("onboarding");

  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [tutorMode, setTutorMode] = useState<TutorMode>("casual");

  const [settingsOpen, setSettingsOpen] = useState(false);

  // -----------------------------
  // SESSION START
  // -----------------------------
  function startSession(data: LearnerProfile) {
    setProfile(data);
    setMessages([]);
    setStreaming("");
    setState("chat");
  }

  // -----------------------------
  // RESET SESSION
  // -----------------------------
  function resetSession() {
    setMessages([]);
    setStreaming("");
    setProfile(null);
    setState("onboarding");
    setSettingsOpen(false);
  }

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  async function sendMessage(input: string) {
    if (!input.trim() || loading || !profile) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages: Message[] = [...messages, userMessage];

    setMessages(updatedMessages);
    setStreaming("");
    setLoading(true);

    const unlistenToken = await listen<string>("token", (e) => {
      setStreaming((prev) => prev + e.payload);
    });

    const unlistenEnd = await listen<string>("token_end", (e) => {
      const assistantMessage: Message = {
        role: "assistant",
        content: e.payload,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      setStreaming("");
      setLoading(false);

      unlistenToken();
      unlistenEnd();
    });

    try {
      await invoke("chat", {
        messages: updatedMessages,
        tutorMode,
        learnerProfile: profile,
      });
    } catch (err) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Error: " + String(err),
      };

      setMessages((prev) => [...prev, errorMessage]);

      setStreaming("");
      setLoading(false);

      unlistenToken();
      unlistenEnd();
    }
  }

  // -----------------------------
  // UI: ONBOARDING
  // -----------------------------
  if (state === "onboarding") {
    return <Onboarding onComplete={startSession} />;
  }

  // -----------------------------
  // UI: CHAT
  // -----------------------------
  return (
    <main className="h-screen flex flex-col bg-background text-foreground overflow-hidden">

      {/* TOP BAR */}
      <div className="flex justify-between items-center p-3 border-b">
        <h1 className="font-bold">Luma</h1>

        <button
          className="text-sm opacity-70 hover:opacity-100"
          onClick={() => setSettingsOpen(true)}
        >
          ⚙️
        </button>
      </div>

      {/* CHAT */}
<div className="flex-1 overflow-hidden">
  <ChatWindow
    messages={messages}
    streaming={streaming}
    loading={loading}
  />
</div>

      {/* INPUT */}
      <ChatInput onSend={sendMessage} loading={loading} />

      {/* SETTINGS MODAL */}
      <Settings
        open={settingsOpen}
        tutorMode={tutorMode}
        setTutorMode={setTutorMode}
        onClose={() => setSettingsOpen(false)}
        onReset={resetSession}
      />
    </main>
  );
}

export default App;