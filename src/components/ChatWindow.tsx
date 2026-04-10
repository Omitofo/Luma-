import { Message } from "../App";

interface Props {
  messages: Message[];
  streaming: string;
}

export default function ChatWindow({ messages, streaming }: Props) {
  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <div key={i} className={`message-row ${msg.role}`}>
          <div className={`bubble ${msg.role}`}>
            {msg.role === "assistant" && "🤖 "}
            {msg.content}
          </div>
        </div>
      ))}

      {streaming && (
        <div className="message-row assistant">
          <div className="bubble assistant">
            🤖 {streaming}
          </div>
        </div>
      )}
    </div>
  );
}