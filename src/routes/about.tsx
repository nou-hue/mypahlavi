import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <LayoutShell>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="mb-14 space-y-5 archive-rise">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            About
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            The archive of a lost modernity
          </h1>
        </header>

        <article className="space-y-8 font-serif text-[1.05rem] leading-[1.8] text-ink-soft archive-rise">
          <p>
            mypahlavi.com is an independent archive documenting the people,
            culture, images and modern history surrounding the Pahlavi era and
            its continuing legacy.
          </p>
          <p>
            It is not an official family website. It is not a political campaign.
            It is a curated collection of photography, lineage, writing, and
            limited editions — held with editorial care.
          </p>
          <p>
            The work distinguishes archival documentation from editorial
            interpretation. Captions name year, place, and person. Where the
            record is incomplete, the caption says so. Advocacy, when present,
            is labeled as such — not dressed as history.
          </p>
          <p className="border-l-2 border-accent/50 pl-5 italic text-ink-muted">
            We preserve. We document. We contextualise. We curate. We do not
            need to shout.
          </p>
          <p>
            The collection covers the court and the household, but also the
            wider field of Iranian modernism: architecture, fashion, diplomacy,
            education, exile, and the diaspora. Reza Pahlavi appears as a major
            chapter within that universe — not as the entire conceptual centre.
          </p>
        </article>

        <div className="mt-16 grid gap-4 border-t border-border pt-12 sm:grid-cols-2">
          <Link
            to="/gallery"
            className="group border border-border p-6 transition-colors hover:bg-ground-elevated"
          >
            <p className="font-serif text-xl tracking-tight">The Gallery</p>
            <p className="mt-2 text-sm text-ink-muted">
              Enter the photographic archive
            </p>
          </Link>
          <Link
            to="/patronage"
            className="group border border-border p-6 transition-colors hover:bg-ground-elevated"
          >
            <p className="font-serif text-xl tracking-tight">The Circle</p>
            <p className="mt-2 text-sm text-ink-muted">
              Support the working collection
            </p>
          </Link>
        </div>

        <p className="mt-14 text-sm text-ink-subtle">
          Contact{" "}
          <a
            href="mailto:hello@mypahlavi.com"
            className="text-ink-muted underline decoration-border underline-offset-4 hover:text-ink"
          >
            hello@mypahlavi.com
          </a>
        </p>
      </div>
    </LayoutShell>
  );
}
