/** Einfache Linien-Symbole (dekorativ, die Bedeutung steht immer im Text daneben). */
const paths = {
  kalender: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
    </>
  ),
  laptop: (
    <>
      <rect x="5" y="4.5" width="14" height="10" rx="2" />
      <path d="M2.5 19h19M9 11l2 2 4-4" />
    </>
  ),
  liste: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />,
  uhr: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  kind: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M7 11.5 12 10l5 1.5M12 10v5M9.5 20l2.5-5 2.5 5" />
    </>
  ),
  notfall: (
    <>
      <path d="M12 3.5 21 19.5H3z" />
      <path d="M12 10v4.5M12 17h.01" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
