import Link from "next/link";

export default function NotFound() {
  return (
    <div className="gh-container py-16">
      <h1 className="text-4xl">Seite nicht gefunden</h1>
      <p className="mt-4">Diese Seite gibt es nicht (mehr).</p>
      <p className="mt-6">
        <Link href="/de/" className="gh-button gh-button-primary">
          Zur Startseite
        </Link>
      </p>
    </div>
  );
}
