import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <LayoutShell>
      <main className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
        <header className="grid gap-10 border-b border-border pb-16 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink-subtle">
              About MyPahlavi
            </p>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-balance font-serif text-5xl leading-[1] tracking-[-0.035em] sm:text-6xl">
              A research-led archive, journal and Editions house.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-ink-muted">
              MyPahlavi studies twentieth-century Iran through photographs, buildings,
              objects, testimony and primary documents. It is independent and is not an
              official family website.
            </p>
          </div>
        </header>

        <section className="grid gap-12 py-20 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-subtle">
            Editorial method
          </p>
          <div className="max-w-3xl space-y-8 font-serif text-xl leading-[1.75] text-ink-soft">
            <p>
              The archive does not ask a photograph to carry more certainty than it
              possesses. Dates, locations, attribution and rights status are treated
              as catalogue information, not decoration.
            </p>
            <p>
              Oral testimony is identified as recollection. Diplomatic and government
              records are identified by the institution that produced them. Scholarly
              interpretation is distinguished from primary evidence. Where sources
              conflict, the disagreement remains visible.
            </p>
            <p>
              The subject includes state-building, culture, architecture, education,
              diplomacy, everyday life, political conflict, revolution, exile and
              diaspora. Achievement and harm are not made mutually exclusive by the
              design of the site.
            </p>
          </div>
        </section>

        <section className="grid gap-12 border-t border-border py-20 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-subtle">
            Image standard
          </p>
          <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
            {[
              ["Provenance", "Source and rights status are recorded before an image is promoted editorially."],
              ["Restoration", "Dust, tilt and tonal damage may be corrected. Missing historical detail is not invented."],
              ["Presentation", "Important photographs keep their full composition inside a generous paper border whenever possible."],
              ["Captions", "Uncertain dates, identifications and institutional perspective are labelled explicitly."],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-border pt-5">
                <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-12 border-t border-border py-20 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-subtle">
            Editions
          </p>
          <div className="max-w-3xl">
            <p className="font-serif text-3xl leading-snug tracking-tight">
              Research can become an object without becoming souvenir merchandise.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-muted">
              Editions are developed from original artwork, rights-cleared archival
              material and research themes. Prints, desk objects and paper goods are
              designed for their final format and are released only after production
              quality and mockups pass review.
            </p>
            <div className="mt-10 flex flex-wrap gap-6">
              <Link to="/library" className="border-b border-ink pb-1 font-sans text-[0.6rem] uppercase tracking-[0.18em]">
                Read the Journal →
              </Link>
              <Link to="/editions" className="border-b border-ink pb-1 font-sans text-[0.6rem] uppercase tracking-[0.18em]">
                View Editions →
              </Link>
            </div>
          </div>
        </section>

        <p className="border-t border-border pt-8 text-sm text-ink-subtle">
          Contact{" "}
          <a
            href="mailto:hello@mypahlavi.com"
            className="text-ink-muted underline decoration-border underline-offset-4 hover:text-ink"
          >
            hello@mypahlavi.com
          </a>
        </p>
      </main>
    </LayoutShell>
  );
}
