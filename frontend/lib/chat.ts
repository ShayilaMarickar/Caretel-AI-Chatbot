const SESSION_KEY = "caretel_chat_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;

export async function sendMessage(message: string): Promise<string> {
  const sessionId = getSessionId();

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "sendMessage",
      sessionId,
      chatInput: message,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.output ?? data.text ?? data.message ?? "Sorry, I couldn't process that.";
}