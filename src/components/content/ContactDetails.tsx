import { Val } from "@/components/ui/Todo";
import { telHref } from "@/lib/links";
import { contentLocale, getDictionary, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  name?: string;
  strasse?: string | null;
  plzOrt?: string | null;
  telefon?: string | null;
  email?: string | null;
  className?: string;
}

/** Anschrift, Telefon (tel:) und E-Mail (mailto:) einheitlich ausgeben. */
export function ContactDetails({ locale, name, strasse, plzOrt, telefon, email, className = "" }: Props) {
  const t = getDictionary(contentLocale(locale));
  return (
    <div className={className}>
      {(name || strasse || plzOrt) && (
        <address className="not-italic">
          {name && <span className="block font-bold">{name}</span>}
          {strasse !== undefined && (
            <span className="block">
              <Val>{strasse}</Val>
            </span>
          )}
          {plzOrt !== undefined && (
            <span className="block">
              <Val>{plzOrt}</Val>
            </span>
          )}
        </address>
      )}
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {telefon !== undefined && (
          <>
            <dt className="font-bold">{t.phone}</dt>
            <dd>{telefon ? <a href={telHref(telefon)}>{telefon}</a> : <Val>{null}</Val>}</dd>
          </>
        )}
        {email !== undefined && (
          <>
            <dt className="font-bold">{t.email}</dt>
            <dd className="break-all">{email ? <a href={`mailto:${email}`}>{email}</a> : <Val>{null}</Val>}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
