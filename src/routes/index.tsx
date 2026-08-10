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

type Section = {
  id: string;
  href: string;
  label: string;
  desc: string;
};

function HomePage() {
  const slides = (siteCopy.heroSlides ?? []) as Slide[];
  const doors = (siteCopy.doors ?? []) as Door[];
  const sections = (siteCopy.sections ?? []) as Section[];
  const stats = siteCopy.stats;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] ?? slides[0];

  return (
    <LayoutShell ghostHeader>
      {/* 01 HERO — keep the photograph */}
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
          {/* Stronger bottom authority for meta + CTA */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/35 to-deep/30"
          />
          <span aria-hidden className="absolute inset-0" />
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-10 pb-14 pt-[calc(7rem+var(--grok-banner-h,0px))] sm:px-12 sm:pb-16">
          <div className="mx-auto w-full max-w-[90rem] space-y-7 archive-rise">
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.34em] text-cream/80">
              {active?.meta}
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-3 font-sans text-[0.75rem] uppercase tracking-[0.24em] text-cream transition-opacity hover:opacity-70"
            >
              {siteCopy.ctaPrimary}
              <span aria-hidden className="text-base leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 02 One-line archive statement — less explaining */}
      <section className="bg-ground">
        <div className="mx-auto max-w-2xl px-10 py-24 text-center sm:px-12 sm:py-32">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.34em] text-ink-subtle">
            {siteCopy.brand}
          </p>
          <h1 className="mt-8 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
            {siteCopy.positioning}
          </h1>
          <p className="mt-8 font-sans text-[0.68rem] uppercase tracking-[0.22em] text-ink-subtle">
            {siteCopy.tagline}
          </p>
        </div>
      </section>

      {/* 03–05 Editorial rooms — not website cards */}
      <section className="bg-ground">
        <div className="mx-auto max-w-[90rem]">
          {doors.map((door, i) => {
            const odd = i % 2 === 1;
            return (
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
                className={cn(
                  "group relative grid min-h-[70svh] overflow-hidden bg-deep md:min-h-[78svh]",
                  odd ? "md:grid-cols-[1.1fr_0.9fr]" : "md:grid-cols-[0.9fr_1.1fr]",
                )}
              >
                <div
                  className={cn(
                    "relative min-h-[42svh] md:min-h-full",
                    odd ? "md:order-2" : "md:order-1",
                  )}
                >
                  <img
                    src={door.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.025]"
                    loading="lazy"
                    draggable={false}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-deep/10 transition-colors group-hover:bg-deep/0"
                  />
                </div>
                <div
                  className={cn(
                    "relative flex flex-col justify-end bg-ground px-10 py-14 sm:px-12 sm:py-16 md:justify-center",
                    odd ? "md:order-1 md:items-end md:text-right" : "md:order-2",
                  )}
                >
                  <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-subtle">
                    {door.meta}
                  </p>
                  <p className="mt-4 font-serif text-5xl tracking-tight text-ink sm:text-6xl md:text-7xl">
                    {door.label}
                  </p>
                  <p
                    className={cn(
                      "mt-5 max-w-sm text-base leading-relaxed text-ink-muted",
                      odd && "md:ml-auto",
                    )}
                  >
                    {door.desc}
                  </p>
                  <p className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ink-subtle transition-opacity group-hover:opacity-70">
                    Enter →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Principles — confident, not defensive */}
      <section className="border-y border-border bg-ground">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-10 py-16 sm:px-12 sm:py-20">
          {["Preserve", "Document", "Contextualise", "Curate"].map((word) => (
            <p
              key={word}
              className="font-sans text-[0.72rem] uppercase tracking-[0.28em] text-ink"
            >
              {word}
            </p>
          ))}
        </div>
      </section>

      {/* Explore the archive — not “the institution” */}
      <section className="bg-ground">
        <div className="mx-auto max-w-5xl px-10 py-20 sm:px-12 sm:py-28">
          <p className="mb-12 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            Explore the archive
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
                className="group border-t border-border py-9 sm:border-r sm:px-8 sm:odd:pl-0 sm:even:border-r-0 sm:even:pr-0 last:border-b sm:[&:nth-last-child(-n+2)]:border-b"
              >
                <p className="font-serif text-2xl tracking-tight transition-opacity group-hover:opacity-60 sm:text-3xl">
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

      {/* Currently in the archive — feels alive */}
      {stats && (
        <section className="border-t border-border bg-ground-elevated">
          <div className="mx-auto max-w-[90rem] px-10 py-16 sm:px-12 sm:py-20">
            <p className="mb-10 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
              {stats.label}
            </p>
            <div className="grid gap-8 sm:grid-cols-3">
              {stats.items.map((item) => (
                <div key={item.place} className="border-t border-border pt-5">
                  <p className="font-serif text-xl tracking-tight">{item.place}</p>
                  <p className="mt-2 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </LayoutShell>
  );
}
