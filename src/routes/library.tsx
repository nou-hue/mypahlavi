import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  galleryImages,
  libraryItems,
  type GalleryImage,
  type LibraryItem,
} from "@/data/archive";
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

/**
 * Related archival plates per publication — existing gallery assets only.
 * Never decorative or generated imagery.
 */
const relatedPlates: Record<string, string[]> = {
  "l-01": ["g-006", "g-003", "g-001"], // The private frame — household photographs
  "l-02": ["g-014", "g-013", "g-031"], // Ceremony — coronation
  "l-03": ["g-014", "g-012", "g-036"], // Shahbanu
  "l-04": ["g-001", "g-010"], // On looking carefully
  "l-05": ["g-032", "g-033", "g-022"], // After the palace
  "l-06": ["g-015", "g-046"], // How a caption works
};

function platesFor(item: LibraryItem): GalleryImage[] {
  const ids = relatedPlates[item.id] ?? [];
  return ids
    .map((id) => galleryImages.find((g) => g.id === id))
    .filter(Boolean) as GalleryImage[];
}

function LibraryPage() {
  const [kind, setKind] = useState<string>("all");
  const [activeId, setActiveId] = useState(libraryItems[0]?.id ?? "");

  const filtered = useMemo(() => {
    if (kind === "all") return libraryItems;
    return libraryItems.filter((i) => i.kind === kind);
  }, [kind]);

  const active =
    filtered.find((i) => i.id === activeId) ?? filtered[0] ?? null;

  const featured = libraryItems[0];
  const featuredPlates = featured ? platesFor(featured) : [];
  const featuredImage = featuredPlates[0];

  return (
    <LayoutShell>
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
        {/* Header */}
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

        {/* Featured essay — medium plate, not full-bleed */}
        {featured && (
          <section className="mb-20 border-t border-border pt-14 sm:mb-28 sm:pt-16">
            <p className="mb-8 font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
              Featured · {featured.kind} · {featured.year}
            </p>
            <button
              type="button"
              onClick={() => {
                setKind("all");
                setActiveId(featured.id);
              }}
              className="group w-full text-left"
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
            </button>
          </section>
        )}

        {/* Quiet index filters */}
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-10">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setKind(k.id);
                const first = libraryItems.find(
                  (i) => k.id === "all" || i.kind === k.id,
                );
                if (first) setActiveId(first.id);
              }}
              className={cn(
                "font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors",
                kind === k.id
                  ? "text-ink"
                  : "text-ink-subtle hover:text-ink",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Literary catalogue index */}
        <section className="mb-16 sm:mb-20">
          <p className="mb-6 font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            Index
          </p>
          <ol className="border-t border-border">
            {filtered.map((item, i) => {
              const isActive = active?.id === item.id;
              return (
                <li key={item.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "flex w-full items-baseline gap-4 py-5 text-left transition-opacity sm:gap-6",
                      isActive ? "opacity-100" : "opacity-75 hover:opacity-100",
                    )}
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
                  </button>
                </li>
              );
            })}
          </ol>
          {filtered.length === 0 && (
            <p className="py-12 text-center font-serif text-lg text-ink-muted">
              Nothing in this index yet.
            </p>
          )}
        </section>

        {/* Open document — reading pane */}
        {active && <ReadingPane item={active} />}

        {/* From the archive — small plates + gallery link */}
        <section className="mt-24 border-t border-border pt-16 sm:mt-32 sm:pt-20">
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

function ReadingPane({ item }: { item: LibraryItem }) {
  const plates = platesFor(item);
  const heroPlate = plates[0];
  const morePlates = plates.slice(1);

  return (
    <article className="border-t border-border pt-12 archive-fade sm:pt-14">
      <p className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-ink-subtle">
        {item.kind} · {item.year}
      </p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
        {item.title}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{item.author}</p>

      <p className="mt-8 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft sm:text-xl">
        {item.excerpt}
      </p>

      {/* Document object — medium, not dominating */}
      {heroPlate?.src && (
        <figure className="mx-auto my-12 max-w-[16rem] sm:mx-0 sm:max-w-[18rem]">
          <div className="overflow-hidden border border-border/50 bg-cream">
            <img
              src={heroPlate.src}
              alt={heroPlate.title}
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
          <figcaption className="mt-3 space-y-1">
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
              {heroPlate.year}
              {heroPlate.place && heroPlate.place !== "Archive"
                ? ` · ${heroPlate.place}`
                : ""}
            </p>
            <p className="text-xs leading-relaxed text-ink-muted">
              {heroPlate.cardCaption || heroPlate.caption}
            </p>
            <Link
              to="/gallery"
              search={{ id: heroPlate.id, room: heroPlate.room }}
              className="inline-block pt-1 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle transition-colors hover:text-ink"
            >
              View in Gallery →
            </Link>
          </figcaption>
        </figure>
      )}

      {/* Narrow reading column */}
      <div className="max-w-[34rem] space-y-6 font-serif text-[1.05rem] leading-[1.8] text-ink-soft">
        {item.body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-x-4 gap-y-1">
        {item.tags.map((t) => (
          <span
            key={t}
            className="font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Related plates */}
      {morePlates.length > 0 && (
        <div className="mt-14 border-t border-border pt-10">
          <p className="mb-6 font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
            Related plates
          </p>
          <div className="flex flex-wrap gap-6 sm:gap-8">
            {morePlates.map((g) => (
              <Link
                key={g.id}
                to="/gallery"
                search={{ id: g.id, room: g.room }}
                className="group w-[6.5rem] sm:w-[7.5rem]"
              >
                {g.src ? (
                  <div className="overflow-hidden border border-border/50 bg-cream">
                    <img
                      src={g.src}
                      alt={g.title}
                      className="aspect-[4/5] w-full object-cover transition-opacity group-hover:opacity-90"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                ) : null}
                <p className="mt-2 font-sans text-[0.5rem] uppercase tracking-[0.12em] text-ink-subtle">
                  {g.year}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                  {g.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
