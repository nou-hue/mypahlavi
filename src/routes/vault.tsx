import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

const rooms = [
  {
    id: "photography",
    title: "Unpublished photography",
    meta: "VAULT · 01",
    desc: "Contact sheets, private moments, and alternate takes held back from the public hang.",
  },
  {
    id: "documents",
    title: "Documents & correspondence",
    meta: "VAULT · 02",
    desc: "Letters, briefs, and papers where the record allows — each release accompanied by contextual notes.",
  },
  {
    id: "film",
    title: "Film & moving image",
    meta: "VAULT · 03",
    desc: "Rare footage and stills from ceremonial, diplomatic, and private settings.",
  },
  {
    id: "objects",
    title: "Objects & ephemera",
    meta: "VAULT · 04",
    desc: "Textiles, medals, scans, and material culture documented for the collection — study images, not a shop floor.",
  },
];

function VaultPage() {
  return (
    <LayoutShell>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="mb-16 max-w-2xl space-y-5 archive-rise">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            The Vault
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Rare and unpublished
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            A quieter room of the archive — contact sheets, correspondence, film
            stills, and material culture held for careful release. Some rooms open
            publicly; others first to the Circle.
          </p>
        </header>

        <div className="space-y-0 border-t border-border">
          {rooms.map((room) => (
            <article
              key={room.id}
              className="border-b border-border py-10 archive-fade"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
                <div className="max-w-xl">
                  <p className="font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink-subtle">
                    {room.meta}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl tracking-tight">
                    {room.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {room.desc}
                  </p>
                </div>
                <p className="shrink-0 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle sm:pt-6">
                  Access by invitation
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 border-t border-border pt-12">
          <p className="font-serif text-xl tracking-tight">Support the working collection</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
            The Circle sustains digitisation and early Vault releases as rooms open.
          </p>
          <Link
            to="/patronage"
            className="mt-6 inline-flex h-11 items-center font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            The Circle →
          </Link>
        </div>
      </div>
    </LayoutShell>
  );
}
