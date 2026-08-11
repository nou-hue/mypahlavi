import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <LayoutShell>
      <div className="mx-auto max-w-2xl px-6 py-20 sm:px-10 sm:py-28">
        <header className="mb-14 space-y-5 archive-rise">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            About
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            An independent archive
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Documenting the people, culture, images and modern history surrounding
            the Pahlavi era and its continuing legacy.
          </p>
        </header>

        <article className="space-y-8 font-serif text-[1.05rem] leading-[1.8] text-ink-soft archive-rise">
          <p>
            mypahlavi.com is an independent cultural archive. It gathers photography,
            lineage, writing, and limited editions with editorial care — treating
            images as primary documents rather than decoration.
          </p>
          <p>
            The collection documents Iranian modern history: the court and the
            household, architecture and fashion, diplomacy and education, exile and
            diaspora. Material is curated for precision — year, place, person — and
            for atmosphere without romance.
          </p>
          <p>
            It is not an official family website. It is not a political campaign.
            Where advocacy appears, it is labeled as such — never dressed as history.
          </p>
          <p className="border-l-2 border-border pl-5 text-ink-muted">
            We preserve. We document. We contextualise. We curate. We do not need
            to shout.
          </p>
          <p>
            Editions — prints, apparel, and objects — exist as a natural extension
            of the archive: cultural objects issued from the collection, not a
            separate storefront.
          </p>
        </article>

        <p className="mt-12 font-sans text-[0.62rem] uppercase tracking-[0.18em] text-ink-subtle">
          Independent · Not an official family website
        </p>

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
