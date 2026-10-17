import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { Val } from "@/components/ui/Todo";
import { getEvent, getEvents } from "@/lib/content";
import { formatDate, formatTimeRange } from "@/lib/format";
import { enabledLocales, localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.flatMap((lang) => getEvents(lang).map((e) => ({ lang, slug: e.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/aktuelles/veranstaltungen/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getEvent("de", slug)?.title };
}

export default async function VeranstaltungPage({ params }: PageProps<"/[lang]/aktuelles/veranstaltungen/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const e = getEvent(locale, slug);
  if (!e) notFound();
  return (
    <>
      <PageHeader
        locale={locale}
        title={e.title}
        eyebrow="Veranstaltung"
        crumbs={[
          { label: "Aktuelles", href: "/aktuelles/" },
          { label: "Veranstaltungen", href: "/aktuelles/veranstaltungen/" },
        ]}
      />
      <article className="gh-container py-12">
        <dl className="gh-card grid max-w-2xl grid-cols-1 gap-x-6 gap-y-3 p-6 sm:grid-cols-[10rem_1fr]">
          <dt className="font-bold">Datum</dt>
          <dd>
            <time dateTime={e.start}>{formatDate(e.start)}</time>
          </dd>
          <dt className="font-bold">Uhrzeit</dt>
          <dd>{formatTimeRange(e.start, e.end, e.allDay)}</dd>
          <dt className="font-bold">Ort</dt>
          <dd>
            <Val>{e.location}</Val>
            {e.ortsteil && <> (Ortsteil {e.ortsteil})</>}
          </dd>
          <dt className="font-bold">Veranstalter</dt>
          <dd>
            <Val>{e.organizer}</Val>
          </dd>
        </dl>
        <p className="mt-6 max-w-2xl">
          Alle Angaben ohne Gewähr. Kurzfristige Änderungen erfährst du beim Veranstalter. Beschreibung der Veranstaltung:{" "}
          <Val>TODO: prüfen</Val>
        </p>
        <SourceLink href={e.source} />
        <p className="mt-10">
          <Link href={localeHref(locale, "/aktuelles/veranstaltungen/")}>Zurück zum Veranstaltungskalender</Link>
        </p>
      </article>
    </>
  );
}
