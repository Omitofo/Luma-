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

  function startSession(data: LearnerProfile) {
    setProfile(data);
    setMessages([]);
    setStreaming("");
    setState("chat");
  }

  function resetSession() {
    setMessages([]);
    setStreaming("");
    setProfile(null);
    setState("onboarding");
    setSettingsOpen(false);
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

  if (state === "onboarding") {
    return <Onboarding onComplete={startSession} />;
  }

  return (
    <main className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="flex justify-between items-center p-3 border-b">
        <h1 className="font-bold">Luma</h1>

        <button onClick={() => setSettingsOpen(true)}>
          ⚙️
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatWindow messages={messages} streaming={streaming} />
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />

      {settingsOpen && (
        <Settings
  open={settingsOpen}
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