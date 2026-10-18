"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import chatJson from "../../../content/de/chat.json";
import { ExternalIcon } from "@/components/ui/SmartLink";
import { getChatClient } from "@/lib/chat/client";
import { containsPersonalData, mockAnswer } from "@/lib/chat/mock";
import type { ChatAnswer, ChatLink, ChatTurn } from "@/lib/chat/types";
import { contentLocale, fill, localeHref, type Locale } from "@/lib/i18n";
import { hostOf, isExternal } from "@/lib/links";

const T = chatJson.ui;
const HINWEIS_KEY = "gh-chat-hinweis";
const MAX_LENGTH = 500;

type Message = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; answer: ChatAnswer };

function readAccepted(): boolean {
  try {
    return sessionStorage.getItem(HINWEIS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAccepted() {
  try {
    sessionStorage.setItem(HINWEIS_KEY, "1");
  } catch {
    // ohne Speicher erscheint der Hinweis beim nächsten Laden wieder
  }
}

const noSubscribe = () => () => {};

function ChatIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" width="20" height="20">
      <path
        fill="currentColor"
        d="M4 3h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.2l-3.7 3.1A.9.9 0 0 1 4 16.4V14a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 1.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h1.5v2.2l2.7-2.2H16a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H4Z"
      />
    </svg>
  );
}

/**
 * Chat-Widget (Probe-Version). Knopf unten rechts öffnet einen modalen Dialog
 * (natives <dialog>: Fokus bleibt im Dialog, Escape schließt, Fokus kehrt zurück).
 * Antworten erscheinen in einem role="log"-Bereich und werden so vorgelesen.
 * Ohne JavaScript gibt es keinen Knopf; alle Inhalte sind über die Website erreichbar.
 * Auf der Startseite bleibt der Knopf weg, solange die Foto-Reise läuft.
 */
export function ChatWidget({ locale, phone }: { locale: Locale; phone: string | null }) {
  const textLang = contentLocale(locale);
  const pathname = usePathname() ?? "/";
  const baseId = useId();
  const titleId = `${baseId}-titel`;
  const inputId = `${baseId}-frage`;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");

  // erst im Browser zeigen: ohne JavaScript könnte der Knopf nichts tun
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  // Neue Nachrichten unten zeigen (ohne weiches Scrollen)
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy]);

  const openChat = useCallback(() => {
    const ok = readAccepted();
    setAccepted(ok);
    dialogRef.current?.showModal();
    setOpen(true);
    requestAnimationFrame(() => (ok ? inputRef.current : startRef.current)?.focus());
  }, []);

  const closeChat = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const onClosed = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  const start = () => {
    writeAccepted();
    setAccepted(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const ask = async (text: string) => {
    const q = text.trim().slice(0, MAX_LENGTH);
    if (!q || busy) return;
    // Verlauf ohne Eingaben mit persönlichen Daten (die wurden nicht bearbeitet)
    const history: ChatTurn[] = messages.flatMap((m): ChatTurn[] =>
      m.role === "user"
        ? containsPersonalData(m.text)
          ? []
          : [{ role: "user", text: m.text }]
        : [{ role: "assistant", text: m.answer.text }],
    );
    setMessages((ms) => [...ms, { id: nextId.current++, role: "user", text: q }]);
    setQuestion("");
    setBusy(true);
    let answer: ChatAnswer;
    try {
      // Persönliche Daten verlassen den Browser nie, auch nicht an einen echten Dienst
      answer = containsPersonalData(q)
        ? mockAnswer(q, { entries: [], telefon: phone, email: null, adresse: null, zeiten: [], zeitenHinweis: null, notrufe: [] })
        : await getChatClient().ask({ locale: textLang, question: q, history, page: pathname });
    } catch {
      answer = {
        kind: "unbekannt",
        text: fill(T.error, { phone: phone ?? "" }),
        links: [{ title: "Kontakt", href: "/kontakt/" }],
      };
    }
    setMessages((ms) => [...ms, { id: nextId.current++, role: "assistant", answer }]);
    setBusy(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(question);
  };

  const reset = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  if (!mounted) return null;

  return (
    <div lang={textLang === locale ? undefined : textLang}>
      <button
        ref={launcherRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openChat}
        className="gh-button gh-button-primary fixed bottom-4 right-4 z-40 shadow-lg"
        data-chat-launcher
      >
        <ChatIcon />
        {T.open}
      </button>

      <dialog ref={dialogRef} aria-labelledby={titleId} onClose={onClosed} className="gh-chat" data-chat-dialog>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-border bg-brand-soft px-4 py-3">
            <h2 id={titleId} className="mr-auto flex flex-wrap items-baseline gap-x-2 font-sans text-xl font-bold">
              {T.title}
              <span className="rounded-full bg-surface px-2 py-0.5 text-sm font-bold text-warm-text">{T.badge}</span>
            </h2>
            {accepted && messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-bold text-brand-text underline"
              >
                {T.reset}
              </button>
            )}
            <button
              type="button"
              onClick={closeChat}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-text hover:bg-surface"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" width="20" height="20">
                <path
                  fill="currentColor"
                  d="m4.4 3.3 5.6 5.6 5.6-5.6 1.1 1.1-5.6 5.6 5.6 5.6-1.1 1.1-5.6-5.6-5.6 5.6-1.1-1.1 5.6-5.6-5.6-5.6z"
                />
              </svg>
              <span className="sr-only">{T.close}</span>
            </button>
          </div>

          {!accepted ? (
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              <p>{T.intro}</p>
              <p>{T.privacy}</p>
              <p className="font-bold">{T.emergency}</p>
              <p>
                <Link href={localeHref(locale, "/datenschutz/#chat-assistent")} onClick={closeChat}>
                  {T.privacyLink}
                </Link>
              </p>
              <p>
                <button ref={startRef} type="button" onClick={start} className="gh-button gh-button-primary">
                  {T.start}
                </button>
              </p>
            </div>
          ) : (
            <>
              <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-4">
                <p className="gh-chat-bubble gh-chat-bot">{T.intro}</p>
                <div role="log" aria-label={T.title} className="mt-3 space-y-3">
                  {messages.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="gh-chat-bubble gh-chat-user">
                        <span className="sr-only">{T.you}: </span>
                        {m.text}
                      </div>
                    ) : (
                      <AnswerBubble key={m.id} answer={m.answer} locale={locale} onNavigate={closeChat} />
                    ),
                  )}
                </div>
                {messages.length === 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-muted">{T.suggestions}:</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {chatJson.vorschlaege.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            onClick={() => void ask(s)}
                            className="gh-button gh-button-secondary min-h-10 px-3 py-1.5 text-sm"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p role="status" className="mt-3 text-sm text-muted">
                  {busy ? T.thinking : ""}
                </p>
              </div>
              <form onSubmit={onSubmit} className="border-t border-border px-4 pb-4 pt-3">
                <label htmlFor={inputId} className="mb-1 block text-sm font-bold">
                  {T.inputLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={MAX_LENGTH}
                    autoComplete="off"
                    enterKeyHint="send"
                    className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-ink-500 bg-surface px-4 text-base text-text"
                  />
                  <button type="submit" className="gh-button gh-button-primary" aria-disabled={busy || !question.trim()}>
                    {T.send}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">{T.disclaimer}</p>
              </form>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

function AnswerLink({ link, locale, onNavigate }: { link: ChatLink; locale: Locale; onNavigate: () => void }) {
  if (isExternal(link.href)) {
    return (
      <a href={link.href} rel="noopener">
        {link.title}
        <ExternalIcon />
        <span className="sr-only"> (externer Link, öffnet {hostOf(link.href)})</span>
      </a>
    );
  }
  if (/^(tel:|mailto:)/.test(link.href)) return <a href={link.href}>{link.title}</a>;
  return (
    <Link href={localeHref(locale, link.href)} onClick={onNavigate}>
      {link.title}
    </Link>
  );
}

function AnswerBubble({ answer, locale, onNavigate }: { answer: ChatAnswer; locale: Locale; onNavigate: () => void }) {
  return (
    <div className="gh-chat-bubble gh-chat-bot" data-chat-answer={answer.kind}>
      <span className="sr-only">{T.bot}: </span>
      <p>{answer.text}</p>
      {!!answer.items?.length && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          {answer.items.map((i) => (
            <div key={`${i.label}-${i.value}`} className="contents">
              <dt className="font-bold">{i.label}</dt>
              <dd>{i.href ? <a href={i.href}>{i.value}</a> : i.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {answer.links.length > 0 && (
        <ul aria-label={T.linksLabel} className="mt-2 space-y-1">
          {answer.links.map((l) => (
            <li key={l.href}>
              <AnswerLink link={l} locale={locale} onNavigate={onNavigate} />
              {l.type && <span className="text-sm text-muted"> · {l.type}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
