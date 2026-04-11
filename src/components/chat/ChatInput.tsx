import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Props {
  onSend: (input: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: Props) {
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  }

  return (
    <div className="border-t p-3 flex gap-2 bg-background">

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Message Luma..."
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
        className="h-11"
      />

      <Button
        onClick={send}
        disabled={loading}
        className="h-11 px-5"
      >
        {loading ? "..." : "Send"}
      </Button>
    </div>
  );
}