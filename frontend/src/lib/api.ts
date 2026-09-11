const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface IndexTranscriptResponse {
  message: string;
}

interface ApiErrorBody {
  detail?: string;
}

/**
 * Accepts a raw video id, a full watch URL, a youtu.be short link, an embed
 * URL, or a shorts URL and returns the 11-character YouTube video id.
 */
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    const vParam = url.searchParams.get("v");
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;

    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    return null;
  }

  return null;
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function indexTranscript(videoId: string): Promise<IndexTranscriptResponse> {
  const res = await fetch(`${API_BASE}/youtube/${videoId}`, {
    method: "POST",
  });
  const data = await parseJsonSafe<IndexTranscriptResponse & ApiErrorBody>(res);

  if (!res.ok) {
    throw new Error(data?.detail || "Couldn't load a transcript for this video.");
  }
  return data as IndexTranscriptResponse;
}

export async function sendChatMessage(query: string): Promise<string> {
  const res = await fetch(`${API_BASE}/youtube/chatllm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await parseJsonSafe<string | ApiErrorBody>(res);

  if (!res.ok) {
    throw new Error((data as ApiErrorBody)?.detail || "Something went wrong getting a response.");
  }
  return data as string;
}
