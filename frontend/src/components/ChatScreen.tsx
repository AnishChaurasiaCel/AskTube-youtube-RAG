import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Logo from "./Logo.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { sendChatMessage } from "../lib/api.ts";
import type { ChatMessageData } from "../types.ts";

const SUGGESTIONS = [
  "Summarize this video in a few sentences",
  "What are the key takeaways?",
  "Explain the main topic like I'm new to it",
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

interface ChatScreenProps {
  videoId: string;
  onReset: () => void;
}

export default function ChatScreen({ videoId, onReset }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function submitQuery(query: string) {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessageData = { id: makeId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const answer = await sendChatMessage(trimmed);
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitQuery(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitQuery(input);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-base-800 px-6 py-4">
        <Logo size="sm" />
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-base-700 px-3 py-1.5 text-xs font-medium text-base-300 transition hover:border-base-600 hover:text-base-100"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M19 12H5m0 0 6-6m-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          New video
        </button>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,420px)_1fr]">
        <aside className="border-b border-base-800 p-5 lg:border-b-0 lg:border-r lg:overflow-y-auto lg:scroll-thin">
          <div className="overflow-hidden rounded-xl border border-base-700 bg-black shadow-lg shadow-black/30">
            <div className="aspect-video w-full">
              <iframe
                key={videoId}
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-base-700 bg-base-850/50 p-3.5">
            <p className="text-xs font-medium text-base-400">Indexed video</p>
            <p className="mt-1 truncate font-mono text-sm text-base-100">{videoId}</p>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div ref={scrollRef} className="scroll-thin flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 shadow-lg shadow-brand-600/30">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
                    <path
                      d="M21 11.5a8.5 8.5 0 0 1-12.32 7.6L3 20l1.08-5.4A8.5 8.5 0 1 1 21 11.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-base-100">Ask something about this video</h2>
                <p className="mt-1.5 max-w-sm text-sm text-base-400">
                  Answers are grounded in the transcript — try a summary or a specific detail.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submitQuery(s)}
                      className="rounded-full border border-base-700 bg-base-850/60 px-3.5 py-1.5 text-xs font-medium text-base-300 transition hover:border-brand-500/50 hover:text-base-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => <ChatMessage key={m.id} message={m} />)
            )}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 text-white shadow-md shadow-brand-600/20">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-base-700 bg-base-850 px-4 py-3">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-base-400 [animation-delay:0ms]" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-base-400 [animation-delay:150ms]" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-base-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 border-t border-base-800 p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-base-700 bg-base-850/70 p-2 focus-within:border-brand-500/60">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the video…"
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-base-100 placeholder:text-base-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-600/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-base-400">
              Press Enter to send, Shift+Enter for a new line
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
