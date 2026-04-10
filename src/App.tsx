import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import ChatWindow from "./components/chat/ChatWindow";
import ChatInput from "./components/chat/ChatInput";
import Onboarding from "./components/Onboarding";
import Settings from "./components/Settings";

import { Message } from "./types/chat";
import { LearnerProfile, TutorMode } from "./types/tutor";

import "./App.css";

type AppState = "onboarding" | "chat";

function App() {
  const [state, setState] = useState<AppState>("onboarding");

  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [tutorMode, setTutorMode] = useState<TutorMode>("casual");

  const [settingsOpen, setSettingsOpen] = useState(false);

  async function startSession(data: LearnerProfile, mode: TutorMode) {
    setProfile(data);
    setTutorMode(mode);
    setState("chat");
  }

  async function resetSession() {
    setMessages([]);
    setStreaming("");
    setProfile(null);
    setState("onboarding");
  }

  async function sendMessage(input: string) {
    if (!input.trim() || loading || !profile) return;

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
        { role: "assistant", content: event.payload },
      ]);

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + String(err) },
      ]);

      setStreaming("");
      setLoading(false);
    }
  }

  // ======================
  // ONBOARDING SCREEN
  // ======================
  if (state === "onboarding") {
    return (
      <Onboarding
        onStart={startSession}
      />
    );
  }

  // ======================
  // CHAT SCREEN
  // ======================
  return (
    <main className="container">
      {/* HEADER */}
      <div className="top-bar">
        <h1>Luma</h1>

        <button
          className="settings-btn"
          onClick={() => setSettingsOpen(true)}
        >
          ⚙️
        </button>
      </div>

      <ChatWindow
        messages={messages}
        streaming={streaming}
      />

      <ChatInput
        onSend={sendMessage}
        loading={loading}
      />

      {settingsOpen && (
        <Settings
          tutorMode={tutorMode}
          setTutorMode={setTutorMode}
          onClose={() => setSettingsOpen(false)}
          onReset={resetSession}
        />
      )}
    </main>
  );
}

export default App;