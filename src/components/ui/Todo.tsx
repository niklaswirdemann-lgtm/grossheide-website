import { TODO } from "@/lib/content/types";

/** Kennzeichnet offene, noch zu prüfende Angaben sichtbar. */
export function TodoMark({ label = TODO }: { label?: string }) {
  return <mark className="gh-todo">{label}</mark>;
}

/** Gibt einen Text aus und hebt enthaltene „TODO: prüfen“-Stellen hervor. */
export function Val({ children }: { children: string | number | null | undefined }) {
  if (children === null || children === undefined) return <TodoMark />;
  const text = String(children);
  if (!text.includes(TODO)) return <>{text}</>;
  const parts = text.split(TODO);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <TodoMark />}
        </span>
      ))}
    </>
  );
}
