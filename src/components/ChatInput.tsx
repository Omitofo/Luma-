import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: Props) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;

    onSend(input);
    setInput("");
  }

  return (
    <div className="input-row">
      <input
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Talk to Luma..."
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}