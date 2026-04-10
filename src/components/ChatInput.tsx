import { useState } from "react";

interface Props {
  onSend: (input: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: Props) {
  const [input, setInput] = useState("");

  return (
    <div className="input-row">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend(input);
            setInput("");
          }
        }}
        placeholder="Talk to Luma..."
      />

      <button
        onClick={() => {
          onSend(input);
          setInput("");
        }}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}