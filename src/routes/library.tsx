import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  galleryImages,
  libraryItems,
  type GalleryImage,
  type LibraryItem,
} from "@/data/archive";
import { libraryRelatedPlates } from "@/data/library-plates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

const kinds = [
  { id: "all", label: "All" },
  { id: "letter", label: "Letters" },
  { id: "essay", label: "Essays" },
  { id: "book", label: "Books" },
] as const;

function platesFor(item: LibraryItem): GalleryImage[] {
  const ids = libraryRelatedPlates[item.id] ?? [];
  return ids
    .map((id) => galleryImages.find((g) => g.id === id))
    .filter(Boolean) as GalleryImage[];
}

function LibraryPage() {
  const [kind, setKind] = useState<string>("all");

  const filtered = useMemo(() => {
    if (kind === "all") return libraryItems;
    return libraryItems.filter((i) => i.kind === kind);
  }, [kind]);

  const featured = libraryItems[0];
  const featuredImage = featured ? platesFor(featured)[0] : undefined;

  return (
    <LayoutShell>
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-16 max-w-md space-y-5 archive-rise sm:mb-20">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink-subtle">
            The Library
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Reading room
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Essays, letters, and publications for slow attention — museum
            catalogue and independent journal, not a content feed.
          </p>
        </header>

        {/* Featured — links to dedicated article */}
        {featured && (
          <section className="mb-20 border-t border-border pt-14 sm:mb-28 sm:pt-16">
            <p className="mb-8 font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
              Featured · {featured.kind} · {featured.year}
            </p>
            <Link
              to="/library/$slug"
              params={{ slug: featured.slug }}
              className="group block text-left"
            >
              <h2 className="font-serif text-3xl tracking-tight text-ink transition-opacity group-hover:opacity-70 sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                {featured.excerpt}
              </p>

              {featuredImage?.src && (
                <div className="mx-auto mt-10 max-w-[18rem] sm:mx-0 sm:max-w-[20rem] md:max-w-[22rem]">
                  <div className="overflow-hidden border border-border/50 bg-cream">
                    <img
                      src={featuredImage.src}
                      alt={featuredImage.title}
                      className="aspect-[4/5] w-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  <p className="mt-3 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
                    {featuredImage.year}
                    {featuredImage.place && featuredImage.place !== "Archive"
                      ? ` · ${featuredImage.place}`
                      : ""}
                  </p>
                </div>
              )}

              <p className="mt-8 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle">
                {featured.tags.join(" · ")}
              </p>
              <p className="mt-4 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
                Open essay →
              </p>
            </Link>
          </section>
        )}

        {/* Quiet filters */}
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-10">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                "font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors",
                kind === k.id ? "text-ink" : "text-ink-subtle hover:text-ink",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Catalogue index — each title navigates to its article page */}
        <section className="mb-16 sm:mb-20">
          <p className="mb-6 font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            Index
          </p>
          <ol className="border-t border-border">
            {filtered.map((item, i) => (
              <li key={item.id} className="border-b border-border">
                <Link
                  to="/library/$slug"
                  params={{ slug: item.slug }}
                  className="group flex w-full items-baseline gap-4 py-5 text-left opacity-80 transition-opacity hover:opacity-100 sm:gap-6"
                >
                  <span className="w-6 shrink-0 font-sans text-[0.58rem] tabular-nums tracking-[0.08em] text-ink-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-serif text-lg leading-snug tracking-tight sm:text-xl">
                      {item.title}
                    </span>
                    <span className="mt-1 block font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
                      {item.kind}
                      {item.tags[0] ? ` · ${item.tags[0]}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-sans text-[0.58rem] tabular-nums tracking-[0.08em] text-ink-subtle">
                    {item.year}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {filtered.length === 0 && (
            <p className="py-12 text-center font-serif text-lg text-ink-muted">
              Nothing in this index yet.
            </p>
          )}
        </section>

        {/* From the archive */}
        <section className="mt-8 border-t border-border pt-16 sm:pt-20">
          <p className="mb-10 font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            From the archive
          </p>
          <div className="flex flex-wrap gap-8 sm:gap-10">
            {galleryImages
              .filter((g) => g.src)
              .slice(0, 3)
              .map((g) => (
                <Link
                  key={g.id}
                  to="/gallery"
                  search={{ id: g.id, room: g.room }}
                  className="group w-[7.5rem] sm:w-[8.5rem]"
                >
                  <div className="overflow-hidden border border-border/50 bg-cream">
                    <img
                      src={g.src}
                      alt={g.title}
                      className="aspect-[4/5] w-full object-cover transition-opacity group-hover:opacity-90"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  <p className="mt-2 font-sans text-[0.5rem] uppercase tracking-[0.12em] text-ink-subtle">
                    {g.year}
                  </p>
                </Link>
              ))}
          </div>
          <Link
            to="/gallery"
            className="mt-12 inline-flex font-sans text-[0.6rem] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
          >
            Continue exploring the Gallery →
          </Link>
        </section>
      </div>
    </LayoutShell>
  );
}
