import type { Message } from "../../types/chat";

interface Props {
  messages: Message[];
  streaming: string;
  loading?: boolean;
}

export default function ChatWindow({
  messages,
  streaming,
  loading,
}: Props) {
  return (
    <div className="h-full overflow-y-auto px-4 py-6 space-y-4">
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
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {loading && !streaming && (
        <div className="text-sm text-muted-foreground px-2">
          Luma is thinking...
        </div>
      )}

      {streaming && (
        <div className="flex justify-start">
          <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-muted text-foreground">
            {streaming}
          </div>
        </div>
      )}
    </div>
  );
}