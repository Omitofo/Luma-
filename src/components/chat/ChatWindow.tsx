import { useEffect, useRef } from "react";
import type { Message } from "../../types/chat";

interface Props {
  messages: Message[];
  streaming: string;
  loading: boolean;
}

export default function ChatWindow({
  messages,
  streaming,
  loading,
}: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, streaming]);

  return (
    <div className="h-full overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-muted">
      {/* EMPTY STATE */}
      {messages.length === 0 && !streaming && !loading && (
        <div className="h-full flex items-center justify-center text-center">
          <div className="space-y-3 max-w-md">
            <h2 className="text-2xl font-semibold">
              Welcome to Luma
            </h2>

            <p className="text-muted-foreground text-sm">
              Start practicing with your AI tutor.
              Ask questions, practice conversation,
              or request grammar explanations.
            </p>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${
            msg.role === "user"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {/* STREAMING MESSAGE */}
      {streaming && (
        <div className="flex justify-start">
          <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-card border border-border">
            {streaming}
          </div>
        </div>
      )}

      {/* TYPING INDICATOR */}
      {loading && !streaming && (
        <div className="flex justify-start">
          <div className="bg-card border border-border rounded-2xl px-4 py-3 flex gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}