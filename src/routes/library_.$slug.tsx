import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  galleryImages,
  getLibraryItem,
  libraryItems,
  type GalleryImage,
  type LibraryItem,
} from "@/data/archive";
import { libraryRelatedPlates } from "@/data/library-plates";

export const Route = createFileRoute("/library_/$slug")({
  component: LibraryArticlePage,
});

function platesFor(item: LibraryItem): GalleryImage[] {
  const ids = libraryRelatedPlates[item.id] ?? [];
  return ids
    .map((id) => galleryImages.find((g) => g.id === id))
    .filter(Boolean) as GalleryImage[];
}

function LibraryArticlePage() {
  const { slug } = Route.useParams();
  const item = getLibraryItem(slug);

  if (!item) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl tracking-tight">Not found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            This publication is not in the Library.
          </p>
          <Link
            to="/library"
            className="mt-8 inline-flex font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted hover:text-ink"
          >
            ← Back to Library
          </Link>
        </div>
      </LayoutShell>
    );
  }

  const plates = platesFor(item);
  const hero = plates[0];
  const related = plates.slice(1);
  const moreReading = libraryItems
    .filter((i) => i.id !== item.id)
    .slice(0, 3);

  return (
    <LayoutShell>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:px-10 sm:py-20">
        <Link
          to="/library"
          className="mb-12 inline-flex items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.25} /> Back to Library
        </Link>

        <header className="max-w-xl archive-rise">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.22em] text-ink-subtle">
            Library · {item.kind} · {item.year}
          </p>
          <h1 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            {item.title}
          </h1>
          <p className="mt-6 max-w-md font-serif text-lg italic leading-relaxed text-ink-soft sm:text-xl">
            {item.excerpt}
          </p>
          <p className="mt-4 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
            {item.author}
          </p>
        </header>

        {/* Archival plate — controlled frame, existing asset */}
        {hero?.src && (
          <figure className="mx-auto my-14 max-w-[18rem] sm:mx-0 sm:max-w-[20rem] md:max-w-[22rem]">
            <div className="overflow-hidden border border-border/50 bg-cream">
              <img
                src={hero.src}
                alt={hero.title}
                className="aspect-[4/5] w-full object-cover"
                draggable={false}
              />
            </div>
            <figcaption className="mt-4 space-y-1.5">
              <p className="font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
                {hero.year}
                {hero.place && hero.place !== "Archive"
                  ? ` · ${hero.place}`
                  : ""}
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-ink-muted">
                {hero.cardCaption || hero.caption}
              </p>
              <Link
                to="/gallery"
                search={{ id: hero.id, room: hero.room }}
                className="inline-block pt-1 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle transition-colors hover:text-ink"
              >
                View in Gallery →
              </Link>
            </figcaption>
          </figure>
        )}

        <div className="border-t border-border pt-12">
          <div className="max-w-[34rem] space-y-6 font-serif text-[1.05rem] leading-[1.85] text-ink-soft">
            {item.body.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-x-5 gap-y-1">
            {item.tags.map((t) => (
              <span
                key={t}
                className="font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <p className="mb-8 font-sans text-[0.52rem] uppercase tracking-[0.22em] text-ink-subtle">
              Related plates
            </p>
            <div className="flex flex-wrap gap-8 sm:gap-10">
              {related.map((g) => (
                <Link
                  key={g.id}
                  to="/gallery"
                  search={{ id: g.id, room: g.room }}
                  className="group w-[7rem] sm:w-[8rem]"
                >
                  {g.src && (
                    <div className="overflow-hidden border border-border/50 bg-cream">
                      <img
                        src={g.src}
                        alt={g.title}
                        className="aspect-[4/5] w-full object-cover transition-opacity group-hover:opacity-90"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  )}
                  <p className="mt-2 font-sans text-[0.5rem] uppercase tracking-[0.12em] text-ink-subtle">
                    {g.year}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                    {g.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {moreReading.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <p className="mb-8 font-sans text-[0.52rem] uppercase tracking-[0.22em] text-ink-subtle">
              Related reading
            </p>
            <ul className="space-y-0 border-t border-border">
              {moreReading.map((r) => (
                <li key={r.id} className="border-b border-border">
                  <Link
                    to="/library/$slug"
                    params={{ slug: r.slug }}
                    className="flex items-baseline justify-between gap-6 py-5 opacity-80 transition-opacity hover:opacity-100"
                  >
                    <span className="font-serif text-lg tracking-tight">
                      {r.title}
                    </span>
                    <span className="shrink-0 font-sans text-[0.55rem] uppercase tracking-[0.12em] text-ink-subtle">
                      {r.kind} · {r.year}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-16 border-t border-border pt-10">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.25} /> Back to Library
          </Link>
        </div>
      </article>
    </LayoutShell>
  );
}
