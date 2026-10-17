import type { Metadata } from "next";
import Link from "next/link";
import { ContactDetails } from "@/components/content/ContactDetails";
import { EinrichtungList } from "@/components/content/EinrichtungList";
import { OpeningHours } from "@/components/content/OpeningHours";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Toc } from "@/components/layout/Toc";
import { Photo } from "@/components/ui/Photo";
import { SmartLink } from "@/components/ui/SmartLink";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark, Val } from "@/components/ui/Todo";
import { facts, factValue, getFoto, getOnlineDienst } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Freizeit & Tourismus" };

export default async function FreizeitPage({ params }: PageProps<"/[lang]/freizeit-tourismus">) {
  const locale = await resolveLocale(params);
  const e = facts.einrichtungen;
  const badesee = getFoto({ seite: "freizeitanlagen" });
  const m = e.museum;
  const ti = e.touristInfo;
  const spiel = factValue(e.spielplaetze) ?? [];
  const buchung = getOnlineDienst("wohnmobil-kieselbucht")!;
  return (
    <>
      <PageHeader
        locale={locale}
        title="Freizeit & Tourismus"
        intro="Moor, Wald und Kiessee: Großheide lädt zum Radfahren, Entdecken und Erholen ein, für einen Nachmittag oder den ganzen Urlaub."
      />
      <div className="gh-container space-y-16 py-12">
        <Toc
          locale={locale}
          items={[
            { id: "museum", label: "Wald- und Moormuseum" },
            { id: "freizeitanlagen", label: "Freizeitanlagen" },
            { id: "radrouten", label: "Rad- und Wanderwege" },
            { id: "urlaub", label: "Urlaub" },
            { id: "wohnmobil", label: "Wohnmobilstellplätze" },
            { id: "tourist-info", label: "Tourist-Information" },
          ]}
        />
        <Section
          id="museum"
          title={m.name}
          intro="Das Museum am Berumerfehner Wald erzählt vom früheren Torfabbau, vom Leben der Tiere in Moor und Wald und davon, wie der Mensch die Natur verändert. Schulklassen, Gruppen und Kindergeburtstage sind willkommen."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <ContactDetails
              locale={locale}
              strasse={m.strasse}
              plzOrt={`${m.plz} ${m.ort} (Ortsteil ${m.ortsteil})`}
              telefon={m.telefon}
              email={m.email}
            />
            <div>
              {m.oeffnungszeiten && <OpeningHours days={m.oeffnungszeiten} caption="Öffnungszeiten" />}
              <p className="mt-2">{m.saison}</p>
            </div>
          </div>
          <SourceLink href={m.source} />
        </Section>

        <Section id="freizeitanlagen" title="Freizeitanlagen und Spielplätze">
          {badesee && <Photo foto={badesee} className="mb-8 max-w-2xl" />}
          <EinrichtungList items={e.freizeitanlagen} />
          <h3 className="mt-10 text-2xl">Spielplätze nach Ortsteil</h3>
          <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {spiel.map((s) => (
              <li key={s.name}>
                {s.name} <span className="text-muted">({s.ortsteil})</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <TodoMark /> {e.spielplaetze.note}
          </p>
          <SourceLink href={e.spielplaetze.source} />
        </Section>

        <Section id="radrouten" title="Rad- und Wanderwege" intro="Die Karten zu den Routen gibt es auch im Rathaus.">
          <ul className="grid gap-4 md:grid-cols-2">
            {facts.radrouten.map((r) => (
              <li key={r.id} className="gh-card p-5">
                <h3 className="font-sans text-lg font-bold">
                  <SmartLink locale={locale} href={r.url}>
                    {r.name}
                  </SmartLink>
                </h3>
                <p className="mt-1 text-muted">{r.laenge}</p>
                <SourceLink href={r.source} />
              </li>
            ))}
          </ul>
          <p className="mt-4">
            Wanderwege: <TodoMark />
          </p>
        </Section>

        <Section id="urlaub" title="Urlaub in Großheide">
          <div id="unterkuenfte" className="scroll-mt-28">
            <h3 className="text-2xl">Unterkünfte</h3>
            <p className="mt-2">
              Ferienwohnungen, Hotels und Gästezimmer werden als Verzeichnis übernommen. <TodoMark />
            </p>
          </div>
          <div className="mt-8">
            <h3 className="text-2xl">Veranstaltungen</h3>
            <p className="mt-2">
              <Link href={localeHref(locale, "/aktuelles/veranstaltungen/")}>Zum Veranstaltungskalender</Link>
            </p>
          </div>
        </Section>

        <Section id="wohnmobil" title="Wohnmobilstellplätze">
          <ul className="grid gap-6 lg:grid-cols-2">
            {e.wohnmobilstellplaetze.map((w) => (
              <li key={w.id} className="gh-card p-6">
                <h3 className="font-sans text-xl font-bold">{w.name}</h3>
                <p className="mt-1">
                  {w.strasse}, 26532 Großheide (Ortsteil {w.ortsteil}) · {w.stellplaetze} Stellplätze
                </p>
                <h4 className="mt-4">Ausstattung und Regeln</h4>
                <ul className="mt-1 list-disc pl-5">
                  {w.merkmale.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <h4 className="mt-4">Gebühren</h4>
                <ul className="mt-1 list-disc pl-5">
                  {w.gebuehren.map((x) => (
                    <li key={x}>
                      <Val>{x}</Val>
                    </li>
                  ))}
                </ul>
                {w.id === "kieselbucht" && (
                  <p className="mt-4">
                    <SmartLink locale={locale} href={buchung.url} className="gh-button gh-button-primary">
                      Stellplatz buchen
                    </SmartLink>
                  </p>
                )}
                <SourceLink href={w.source} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="tourist-info" title={ti.name}>
          <ContactDetails locale={locale} telefon={ti.telefon} email={ti.email} />
          <SourceLink href={ti.source} />
        </Section>
      </div>
    </>
  );
}
