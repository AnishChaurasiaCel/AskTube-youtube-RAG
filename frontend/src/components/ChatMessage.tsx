import type { ChatMessageData } from "../types.ts";

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : ""} animate-rise`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-base-700 text-base-100"
            : "bg-gradient-to-br from-brand-400 to-accent-500 text-white shadow-md shadow-brand-600/20"
        }`}
      >
        {isUser ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
          </svg>
        )}
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white"
            : message.error
              ? "rounded-tl-sm border border-accent-500/30 bg-accent-500/10 text-base-100"
              : "rounded-tl-sm border border-base-700 bg-base-850 text-base-100"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
