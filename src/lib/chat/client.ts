import { withBase } from "../links";
import { mockAnswer } from "./mock";
import type { ChatAnswer, ChatKnowledge, ChatRequest } from "./types";

/**
 * Verbindung des Widgets zu seinem Antwortgeber.
 * Standard: Probe-Version im Browser (kein Netz außer der eigenen Datei chat-wissen.json).
 * Mit NEXT_PUBLIC_CHAT_ENDPOINT beim Build: echter Dienst nach docs/chat-api.md.
 * Der echte Weg ist erst testbar, wenn es einen Dienst gibt.
 */
export interface ChatClient {
  ask(request: ChatRequest, signal?: AbortSignal): Promise<ChatAnswer>;
}

const TIMEOUT_MS = 15_000;

function mockClient(): ChatClient {
  const cache = new Map<string, Promise<ChatKnowledge>>();
  const load = (locale: string) => {
    let p = cache.get(locale);
    if (!p) {
      p = fetch(withBase(`/${locale}/chat-wissen.json`)).then((r) => {
        if (!r.ok) throw new Error(`chat-wissen ${r.status}`);
        return r.json() as Promise<ChatKnowledge>;
      });
      p.catch(() => cache.delete(locale));
      cache.set(locale, p);
    }
    return p;
  };
  return {
    async ask(request) {
      const knowledge = await load(request.locale);
      return mockAnswer(request.question, knowledge);
    },
  };
}

function isChatAnswer(x: unknown): x is ChatAnswer {
  if (!x || typeof x !== "object") return false;
  const a = x as Partial<ChatAnswer>;
  return (
    typeof a.kind === "string" &&
    typeof a.text === "string" &&
    Array.isArray(a.links) &&
    a.links.every((l) => typeof l?.title === "string" && typeof l?.href === "string") &&
    (a.items === undefined ||
      (Array.isArray(a.items) && a.items.every((i) => typeof i?.label === "string" && typeof i?.value === "string")))
  );
}

function httpClient(endpoint: string): ChatClient {
  return {
    async ask(request, signal) {
      const timeout = AbortSignal.timeout(TIMEOUT_MS);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(request),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        credentials: "omit",
      });
      if (!res.ok) throw new Error(`chat ${res.status}`);
      const data: unknown = await res.json();
      if (!isChatAnswer(data)) throw new Error("chat: ungültige Antwort");
      return data;
    },
  };
}

let client: ChatClient | null = null;

export function getChatClient(): ChatClient {
  if (!client) {
    const endpoint = process.env.NEXT_PUBLIC_CHAT_ENDPOINT;
    client = endpoint ? httpClient(endpoint) : mockClient();
  }
  return client;
}

/** true, solange die Probe-Version antwortet (für den Hinweis im Widget). */
export const isMockChat = !process.env.NEXT_PUBLIC_CHAT_ENDPOINT;
