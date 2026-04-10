import { Message } from "../App";

interface Props {
  messages: Message[];
}

export default function ChatWindow({ messages }: Props) {
  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`message-row ${msg.role}`}
        >
          <div className={`bubble ${msg.role}`}>
            {msg.role === "assistant" && "🤖 "}
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
}