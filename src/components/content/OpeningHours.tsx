import type { OpeningDay } from "@/lib/content";

interface Props {
  days: OpeningDay[];
  caption?: string;
  /** Kompakte Liste (Footer) statt Tabelle. */
  compact?: boolean;
}

export function OpeningHours({ days, caption, compact }: Props) {
  if (compact) {
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
        {days.map((d) => (
          <div key={d.tag} className="contents">
            <dt>{d.tag}</dt>
            <dd>{d.zeiten.map(withUhr).join(", ")}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <table className="w-full max-w-md border-collapse text-left">
      {caption && <caption className="mb-2 text-left font-bold">{caption}</caption>}
      <thead className="sr-only">
        <tr>
          <th scope="col">Tag</th>
          <th scope="col">Zeiten</th>
        </tr>
      </thead>
      <tbody>
        {days.map((d) => (
          <tr key={d.tag} className="border-b border-border">
            <th scope="row" className="py-2 pr-4 font-bold">
              {d.tag}
            </th>
            <td className="py-2">{d.zeiten.map(withUhr).join(" und ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function withUhr(z: string): string {
  return /\d{2}:\d{2}/.test(z) ? `${z} Uhr` : z;
}
