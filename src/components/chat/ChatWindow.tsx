import { useEffect, useRef } from "react";
import type { Message } from "../../types/chat";

interface Props {
  messages: Message[];
  streaming: string;
  loading: boolean;
}

function formatMessage(text: string) {
  // Split by double line breaks first (sections)
  const blocks = text.split("\n\n");

  return blocks.map((block, i) => {
    const lines = block.split("\n");

    return (
      <div key={i} className="mb-3">
        {lines.map((line, j) => (
          <p
            key={j}
            className="leading-relaxed text-sm mb-1 whitespace-pre-wrap"
          >
            {line}
          </p>
        ))}
      </div>
    );
  });
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
    <div className="h-full overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-muted">
      
      {/* EMPTY STATE */}
      {messages.length === 0 && !streaming && !loading && (
        <div className="h-full flex items-center justify-center text-center">
          <div className="space-y-3 max-w-md">
            <h2 className="text-2xl font-semibold">
              Welcome to Luma
            </h2>
            <p className="text-muted-foreground text-sm">
              Start practicing with your AI tutor. Ask questions,
              practice conversation, or request grammar explanations.
            </p>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm border ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-card border-border text-foreground"
            }`}
          >
            {formatMessage(msg.content)}
          </div>
        </div>
      ))}

      {/* STREAMING */}
      {streaming && (
        <div className="flex justify-start">
          <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm border bg-card border-border">
            {formatMessage(streaming)}
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