import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/archive/layout-shell";
import siteCopy from "@/data/site-copy.json";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type Slide = {
  src: string;
  meta: string;
  caption: string;
};

type Door = {
  id: string;
  label: string;
  href: string;
  desc: string;
  src: string;
  meta: string;
};

function HomePage() {
  const slides = (siteCopy.heroSlides ?? []) as Slide[];
  const doors = (siteCopy.doors ?? []) as Door[];
  const sections = siteCopy.sections ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] ?? slides[0];

  return (
    <LayoutShell ghostHeader>
      {/* FIRST SCREEN — silence → image → intrigue */}
      <section className="relative min-h-[100svh] bg-deep text-cream">
        <div className="absolute inset-0 archive-view-only">
          {slides.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.caption}
              draggable={false}
              className={cn(
                "hero-crossfade absolute inset-0 h-full w-full select-none object-cover",
                i === index ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/25 to-deep/40"
          />
          <span aria-hidden className="absolute inset-0" />
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-5 pb-10 pt-[calc(1.25rem+var(--grok-banner-h,0px))] sm:px-8 sm:pb-12 sm:pt-[calc(1.5rem+var(--grok-banner-h,0px))]">
          <div className="mx-auto flex w-full max-w-6xl items-start justify-between">
            <p className="font-serif text-lg tracking-[0.08em] text-cream sm:text-xl">
              {siteCopy.brand}
            </p>
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-cream/70">
              Archive
            </p>
          </div>

          <div className="mx-auto w-full max-w-6xl space-y-8 archive-rise">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.32em] text-cream/75">
              {active?.meta}
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.22em] text-cream transition-opacity hover:opacity-70"
            >
              {siteCopy.ctaPrimary}
              <span aria-hidden className="text-base leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="border-b border-border bg-ground">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.32em] text-ink-subtle">
            {siteCopy.brand}
          </p>
          <h1 className="mt-6 font-serif text-3xl leading-snug tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
            {siteCopy.positioning}
          </h1>
          <p className="mt-6 font-sans text-[0.68rem] uppercase tracking-[0.2em] text-ink-subtle">
            {siteCopy.tagline}
          </p>
          <p className="mx-auto mt-10 max-w-md text-sm leading-relaxed text-ink-muted">
            {siteCopy.institutionLine}
          </p>
        </div>
      </section>

      {/* Six editorial doors */}
      <section className="bg-ground">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="mb-12 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            The archive
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {doors.map((door, i) => (
              <Link
                key={door.id}
                to={
                  door.href as
                    | "/gallery"
                    | "/lineage"
                    | "/library"
                    | "/vault"
                    | "/editions"
                    | "/patronage"
                }
                className="group relative block aspect-[4/5] overflow-hidden bg-deep archive-fade"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <img
                  src={door.src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                  draggable={false}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/25 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-cream/65">
                    {door.meta}
                  </p>
                  <p className="mt-2 font-serif text-2xl tracking-tight text-cream sm:text-3xl">
                    {door.label}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/70">
                    {door.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="border-t border-border bg-ground">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <p className="font-serif text-xl leading-relaxed text-ink-soft sm:text-2xl">
            {siteCopy.method}
          </p>
          <p className="mt-6 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ink-subtle">
            No shouting · No propaganda · Beautiful evidence
          </p>
        </div>
      </section>

      {/* Institution index */}
      <section className="border-t border-border bg-ground">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="mb-10 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            The institution
          </p>
          <div className="grid gap-0 sm:grid-cols-2">
            {sections.map((s) => (
              <Link
                key={s.id}
                to={
                  s.href as
                    | "/gallery"
                    | "/lineage"
                    | "/library"
                    | "/vault"
                    | "/editions"
                    | "/patronage"
                }
                className="group border-t border-border py-8 sm:border-r sm:px-8 sm:odd:pl-0 sm:even:border-r-0 sm:even:pr-0 last:border-b sm:[&:nth-last-child(-n+2)]:border-b"
              >
                <p className="font-serif text-2xl tracking-tight transition-opacity group-hover:opacity-65">
                  {s.label}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LayoutShell>
  );
}
