import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import { ArchiveImage } from "@/components/archive/archive-image";
import { galleryImages, familyMembers, libraryItems } from "@/data/archive";
import { formatGBP, shopProducts, startingPrice } from "@/data/shop";
import siteCopy from "@/data/site-copy.json";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const heroSrc = siteCopy.heroSrc;
  const featured = galleryImages
    .filter(
      (g) =>
        g.src &&
        (g.personIds.includes("mohammad-reza") ||
          g.personIds.includes("farah") ||
          g.personIds.includes("soraya") ||
          g.personIds.includes("fawzia") ||
          g.room === "coronation" ||
          g.room === "family"),
    )
    .slice(0, 6);
  const people = familyMembers.filter((m) =>
    ["mohammad-reza", "farah", "soraya", "fawzia", "reza", "reza-shah"].includes(
      m.id,
    ),
  );
  const shopFeatured = shopProducts.filter((p) => p.featured).slice(0, 3);
  const essays = libraryItems.slice(0, 3);

  return (
    <LayoutShell>
      {/* Hero — centered editorial plate, natural aspect (no stretch) */}
      <section className="bg-ground">
        <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
          <p className="mb-10 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ink-subtle archive-rise">
            {siteCopy.heroKicker}
          </p>

          {heroSrc ? (
            <figure className="archive-rise w-full max-w-[min(100%,420px)] sm:max-w-[min(100%,480px)]">
              <div className="hero-plate relative w-full overflow-hidden bg-deep archive-view-only">
                <img
                  src={heroSrc}
                  alt={siteCopy.heroCaption}
                  draggable={false}
                  className="mx-auto block h-auto w-full select-none object-contain"
                  style={{ maxHeight: "min(62svh, 640px)" }}
                />
                <span aria-hidden className="absolute inset-0" />
              </div>
              <figcaption className="mt-5 text-center">
                <p className="font-serif text-base italic leading-relaxed text-ink-muted sm:text-lg">
                  {siteCopy.heroCaption}
                </p>
              </figcaption>
            </figure>
          ) : null}

          <div className="mt-12 max-w-lg text-center archive-rise space-y-5">
            <h1 className="font-serif text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
              {siteCopy.heroTitle}
            </h1>
            <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
              {siteCopy.heroSub}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/gallery"
                className="inline-flex h-11 items-center gap-2 bg-ink px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream transition-opacity hover:opacity-85"
              >
                Gallery
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/editions"
                className="inline-flex h-11 items-center border border-border px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink/40"
              >
                Editions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro — journalistic, tight */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <p className="font-serif text-2xl leading-snug tracking-tight text-ink-soft sm:text-3xl text-balance">
            An independent record of the Pahlavi century — from Reza Shah to the
            household of Farah — in image, lineage, and prose.
          </p>
        </div>
      </section>

      {/* Featured gallery strip */}
      <section className="border-t border-border bg-ground-elevated">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
                Selected
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                From the collection
              </h2>
            </div>
            <Link
              to="/gallery"
              className="hidden items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              All {galleryImages.length} <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((img, i) => (
              <Link
                key={img.id}
                to="/gallery"
                search={{ room: img.room, id: img.id }}
                className="group archive-fade"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ArchiveImage
                  src={img.src}
                  alt={img.title}
                  gradient={img.gradient}
                  className="aspect-[3/4] transition-opacity duration-300 group-hover:opacity-90"
                />
                <div className="mt-3 space-y-1">
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ink-subtle">
                    {img.year}
                    {img.place && img.place !== "Archive" ? ` · ${img.place}` : ""}
                  </p>
                  <p className="font-serif text-lg leading-snug">{img.title}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted"
            >
              Full gallery <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Library */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
                Journal
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                Essays & letters
              </h2>
            </div>
            <Link
              to="/library"
              className="hidden items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted hover:text-ink sm:inline-flex"
            >
              Library <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-3">
            {essays.map((e) => (
              <Link
                key={e.id}
                to="/library"
                className="group flex flex-col bg-ground p-7 transition-colors hover:bg-ground-elevated"
              >
                <p className="font-sans text-[0.62rem] uppercase tracking-[0.16em] text-ink-subtle">
                  {e.kind} · {e.year}
                </p>
                <h3 className="mt-3 font-serif text-2xl leading-snug tracking-tight">
                  {e.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {e.excerpt}
                </p>
                <span className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.14em] text-accent">
                  Read
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lineage strip */}
      <section className="border-t border-border bg-deep text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-cream/40">
                Lineage
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                The house
              </h2>
            </div>
            <Link
              to="/lineage"
              className="inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-cream/55 hover:text-cream"
            >
              Family tree <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {people.map((p) => (
              <Link key={p.id} to="/lineage" search={{ person: p.id }} className="group">
                <ArchiveImage
                  src={p.portraitSrc}
                  alt={p.name}
                  gradient={p.portraitGradient}
                  className="aspect-[3/4] transition-opacity group-hover:opacity-85"
                />
                <p className="mt-2.5 font-serif text-sm leading-snug text-cream/90">
                  {p.name}
                </p>
                <p className="text-[0.65rem] text-cream/40">{p.years}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editions — limited / exclusive */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div className="max-w-md">
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
                Limited editions
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                For the wall
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Small-run prints and apparel, produced on demand. Quiet objects from
                the collection.
              </p>
            </div>
            <Link
              to="/editions"
              className="hidden items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted hover:text-ink sm:inline-flex"
            >
              Shop <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {shopFeatured.map((p) => (
              <Link
                key={p.id}
                to="/editions/$productId"
                params={{ productId: p.slug }}
                className="group"
              >
                <div
                  className={cn(
                    "aspect-[4/5] border border-border bg-gradient-to-br transition-opacity group-hover:opacity-90",
                    p.gradient,
                  )}
                />
                <p className="mt-3 font-serif text-lg leading-snug">{p.name}</p>
                <p className="mt-0.5 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-ink-subtle">
                  from {formatGBP(startingPrice(p))}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-ground-elevated">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 sm:flex-row sm:items-center sm:px-8 sm:py-20">
          <div>
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
              Support the archive
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Patronage funds digitization, research, and new chapters of the
              collection.
            </p>
          </div>
          <Link
            to="/patronage"
            className="inline-flex h-11 shrink-0 items-center gap-2 bg-ink px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream hover:opacity-85"
          >
            Patronage <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </LayoutShell>
  );
}
