import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import ChatWindow from "./components/chat/ChatWindow";
import ChatInput from "./components/chat/ChatInput";

import LearnerSetupModal from "./components/tutor/LearnerSetupModal";
import TutorModeSelector from "./components/tutor/TutorModeSelector";
import ConfirmDialog from "./components/tutor/ConfirmDialog";

import "./App.css";

export type TutorMode = "casual" | "academic";

export interface LearnerProfile {
  language: string;
  level: string;
  focus: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);

  const [learnerProfile, setLearnerProfile] =
    useState<LearnerProfile | null>(null);

  const [tutorMode, setTutorMode] =
    useState<TutorMode>("casual");

  const [pendingTutorMode, setPendingTutorMode] =
    useState<TutorMode | null>(null);

  async function sendMessage(input: string) {
    if (!input.trim() || loading || !learnerProfile) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: input,
      },
    ];

    setMessages(updatedMessages);
    setStreaming("");
    setLoading(true);

    const unlistenToken = await listen<string>(
      "token",
      (event) => {
        setStreaming((prev) => prev + event.payload);
      }
    );

    const unlistenEnd = await listen<string>(
      "token_end",
      (event) => {
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
      }
    );

    try {
      await invoke("chat", {
        messages: updatedMessages,
        tutorMode,
        learnerProfile,
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

  function requestTutorModeChange(mode: TutorMode) {
    if (mode === tutorMode) return;

    setPendingTutorMode(mode);
  }

  function confirmTutorModeChange() {
    if (!pendingTutorMode) return;

    setTutorMode(pendingTutorMode);
    setPendingTutorMode(null);

    setMessages([]);
    setStreaming("");
  }

  function cancelTutorModeChange() {
    setPendingTutorMode(null);
  }

  return (
    <main className="container">
      {!learnerProfile && (
        <LearnerSetupModal
          onComplete={setLearnerProfile}
        />
      )}

      <ConfirmDialog
        open={pendingTutorMode !== null}
        title="Change Tutor Mode?"
        message="Changing tutor mode will clear the current chat and start a new tutoring session."
        onConfirm={confirmTutorModeChange}
        onCancel={cancelTutorModeChange}
      />

      <header className="top-bar">
        <h1>Luma</h1>

        <TutorModeSelector
          value={tutorMode}
          onChange={requestTutorModeChange}
        />
      </header>

      <ChatWindow
        messages={messages}
        streaming={streaming}
      />

      <ChatInput
        onSend={sendMessage}
        loading={loading}
      />
    </main>
  );
}

export default App;