import { useState, type FormEvent, type ReactNode } from "react";
import Logo from "./Logo.tsx";
import { extractVideoId, indexTranscript } from "../lib/api.ts";

interface Feature {
  title: string;
  desc: string;
  icon: ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "Paste a link",
    desc: "Drop in any YouTube URL or video ID to get started.",
    icon: (
      <path
        d="M9 12h6m-6 4h6M8 6h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "We index it",
    desc: "The transcript is fetched, chunked, and embedded automatically.",
    icon: (
      <path
        d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2.1 2.1M8.6 15.4l-2.1 2.1m0-11 2.1 2.1m6.8 6.8 2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Ask anything",
    desc: "Chat naturally and get answers grounded in the video.",
    icon: (
      <path
        d="M21 11.5a8.5 8.5 0 0 1-12.32 7.6L3 20l1.08-5.4A8.5 8.5 0 1 1 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

interface LandingScreenProps {
  onReady: (videoId: string) => void;
}

export default function LandingScreen({ onReady }: LandingScreenProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const videoId = extractVideoId(value);
    if (!videoId) {
      setError("That doesn't look like a valid YouTube link or video ID.");
      return;
    }

    setLoading(true);
    try {
      await indexTranscript(videoId);
      onReady(videoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(124,92,255,0.22),transparent)]"
      />

      <header className="flex w-full max-w-6xl items-center justify-between py-7">
        <Logo />
        <a
          href="https://github.com/AnishChaurasiaCel/AskTube-youtube-RAG"
          target="_blank"
          rel="noreferrer"
          className="hidden text-sm font-medium text-base-300 transition hover:text-base-100 sm:block"
        >
          Docs
        </a>
      </header>

      <main className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center py-12 text-center animate-rise">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-base-700 bg-base-850/60 px-3.5 py-1.5 text-xs font-medium text-base-300 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Powered by local RAG + Ollama
        </div>

        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-base-100 sm:text-5xl">
          Talk to any
          <span className="bg-gradient-to-r from-brand-400 to-accent-500 bg-clip-text text-transparent"> YouTube video</span>
        </h1>
        <p className="mt-4 max-w-lg text-balance text-base text-base-300">
          Paste a video and ask questions, request summaries, or dig into the details —
          answers come straight from the transcript.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-9 w-full rounded-2xl border border-base-700 bg-base-850/70 p-2 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-base-900/80 px-4 py-3">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-base-400">
                <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
                <rect x="2.5" y="5" width="19" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Paste a YouTube URL or video ID…"
                className="w-full bg-transparent text-sm text-base-100 placeholder:text-base-400 focus:outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Indexing…
                </>
              ) : (
                <>
                  Start
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-accent-500 animate-fade-in">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        )}

        <div className="mt-16 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-base-700 bg-base-850/40 p-4 text-left backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" className="mb-2.5 h-5 w-5 text-brand-400">
                {f.icon}
              </svg>
              <h3 className="text-sm font-semibold text-base-100">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-base-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="pb-6 text-xs text-base-400">
        Built for exploring long videos without watching every minute.
      </footer>
    </div>
  );
}
