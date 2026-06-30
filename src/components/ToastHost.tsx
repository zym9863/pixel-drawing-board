import type { ToastMessage } from "../lib/types";

interface ToastHostProps {
  messages: ToastMessage[];
  onDismiss(id: string): void;
}

export function ToastHost({ messages, onDismiss }: ToastHostProps) {
  return (
    <div className="toast-host" aria-live="polite" aria-label="消息">
      {messages.map((message) => (
        <button
          key={message.id}
          type="button"
          className={`toast toast-${message.tone}`}
          data-testid="toast"
          onClick={() => onDismiss(message.id)}
        >
          {message.text}
        </button>
      ))}
    </div>
  );
}
