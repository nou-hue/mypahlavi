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

/** Varied editorial treatments — not a modular grid */
const roomLayouts: Record<
  string,
  "full" | "wide-right" | "split" | "wide-left"
> = {
  people: "full",
  places: "wide-right",
  culture: "full",
  modernity: "split",
  memory: "full",
  objects: "wide-left",
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
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] ?? slides[0];

  return (
    <LayoutShell ghostHeader>
      {/* 01 HERO — photograph unchanged */}
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
          {/* Subtle bottom 25% anchor — not a visible “gradient band” */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,9,8,0.82)_0%,rgba(10,9,8,0.35)_28%,rgba(10,9,8,0.12)_48%,rgba(10,9,8,0.22)_100%)]"
          />
          <span aria-hidden className="absolute inset-0" />
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-10 pb-16 pt-[calc(7.5rem+var(--grok-banner-h,0px))] sm:px-12 sm:pb-20">
          <div className="mx-auto w-full max-w-[90rem] space-y-6 archive-rise">
            <p className="font-sans text-[0.85rem] uppercase tracking-[0.32em] text-cream/90 sm:text-[0.9rem]">
              {active?.meta}
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-3 font-sans text-[0.85rem] uppercase tracking-[0.24em] text-cream transition-opacity hover:opacity-70 sm:text-[0.9rem]"
            >
              {siteCopy.ctaPrimary}
              <span aria-hidden className="text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 02 Title page — huge whitespace, no extra copy */}
      <section className="bg-ground">
        <div className="mx-auto max-w-xl px-10 py-32 text-center sm:px-12 sm:py-40 md:py-48">
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.36em] text-ink-subtle">
            {siteCopy.brand}
          </p>
          <h1 className="mt-10 font-serif text-4xl leading-[1.15] tracking-tight text-ink sm:text-5xl md:text-[3.5rem]">
            {siteCopy.positioning}
          </h1>
          <p className="mt-10 font-sans text-[0.72rem] uppercase tracking-[0.22em] text-ink-subtle">
            {siteCopy.tagline}
          </p>
        </div>
      </section>

      {/* 03 Six worlds — editorial rooms, varied rhythm */}
      <section className="bg-ground">
        <div className="mx-auto max-w-[90rem] space-y-0">
          {doors.map((door) => {
            const layout = roomLayouts[door.id] ?? "split";
            return (
              <EditorialRoom key={door.id} door={door} layout={layout} />
            );
          })}
        </div>
      </section>

      {/* 04 Manifesto — large type, no paragraph */}
      <section className="border-y border-border bg-ground">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-10 py-24 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:px-12 sm:py-32 lg:grid-cols-4">
          {["Preserve", "Document", "Contextualise", "Curate"].map((word) => (
            <p
              key={word}
              className="font-serif text-3xl tracking-tight text-ink sm:text-4xl md:text-[2.75rem]"
            >
              {word}
            </p>
          ))}
        </div>
      </section>

      {/* 05 Explore the archive — departments */}
      <section className="bg-ground">
        <div className="mx-auto max-w-5xl px-10 py-24 sm:px-12 sm:py-32">
          <p className="mb-14 font-sans text-[0.68rem] uppercase tracking-[0.3em] text-ink-subtle">
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
                className="group border-t border-border py-10 sm:border-r sm:px-10 sm:odd:pl-0 sm:even:border-r-0 sm:even:pr-0 last:border-b sm:[&:nth-last-child(-n+2)]:border-b"
              >
                <p className="font-serif text-3xl tracking-tight transition-opacity group-hover:opacity-55 sm:text-4xl">
                  {s.label}
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 06 Currently in the archive — museum catalogue metadata */}
      {stats && (
        <section className="border-t border-border bg-ground">
          <div className="mx-auto max-w-[90rem] px-10 py-20 sm:px-12 sm:py-28">
            <p className="mb-12 font-sans text-[0.68rem] uppercase tracking-[0.3em] text-ink-subtle">
              Currently in the archive
            </p>
            <div className="grid gap-10 border-t border-border pt-10 sm:grid-cols-3 sm:gap-12">
              {stats.items.map((item) => (
                <div key={item.place} className="space-y-3">
                  <p className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-ink">
                    {item.place}
                  </p>
                  <p className="font-serif text-2xl tracking-tight text-ink-muted sm:text-3xl">
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

function EditorialRoom({
  door,
  layout,
}: {
  door: Door;
  layout: "full" | "wide-right" | "split" | "wide-left";
}) {
  const href = door.href as
    | "/gallery"
    | "/lineage"
    | "/library"
    | "/vault"
    | "/editions"
    | "/patronage";

  if (layout === "full") {
    return (
      <Link
        to={href}
        className="group relative block min-h-[85svh] overflow-hidden bg-deep"
      >
        <img
          src={door.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.02]"
          loading="lazy"
          draggable={false}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/15 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 px-10 py-12 sm:px-12 sm:py-16">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-cream/70">
            {door.meta}
          </p>
          <p className="mt-3 font-serif text-6xl tracking-tight text-cream sm:text-7xl md:text-8xl">
            {door.label}
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
            {door.desc}
          </p>
          <p className="mt-6 font-sans text-[0.68rem] uppercase tracking-[0.22em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-80">
            Explore →
          </p>
        </div>
      </Link>
    );
  }

  if (layout === "wide-right" || layout === "wide-left") {
    const imageRight = layout === "wide-right";
    return (
      <Link
        to={href}
        className={cn(
          "group grid min-h-[72svh] overflow-hidden bg-ground md:min-h-[80svh]",
          imageRight
            ? "md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]"
            : "md:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]",
        )}
      >
        <div
          className={cn(
            "relative flex flex-col justify-end px-10 py-14 sm:px-12 sm:py-16 md:justify-center",
            imageRight ? "md:order-1" : "md:order-2 md:items-end md:text-right",
          )}
        >
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ink-subtle">
            {door.meta}
          </p>
          <p className="mt-4 font-serif text-5xl tracking-tight text-ink sm:text-6xl md:text-7xl">
            {door.label}
          </p>
          <p
            className={cn(
              "mt-4 max-w-xs text-base leading-relaxed text-ink-muted",
              !imageRight && "md:ml-auto",
            )}
          >
            {door.desc}
          </p>
          <p className="mt-6 font-sans text-[0.68rem] uppercase tracking-[0.22em] text-ink-subtle opacity-0 transition-opacity duration-300 group-hover:opacity-70">
            Explore →
          </p>
        </div>
        <div
          className={cn(
            "relative min-h-[48svh] overflow-hidden bg-deep md:min-h-full",
            imageRight ? "md:order-2" : "md:order-1",
          )}
        >
          <img
            src={door.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.02]"
            loading="lazy"
            draggable={false}
          />
        </div>
      </Link>
    );
  }

  // split 50/50
  return (
    <Link
      to={href}
      className="group grid min-h-[70svh] overflow-hidden bg-ground md:min-h-[78svh] md:grid-cols-2"
    >
      <div className="relative min-h-[48svh] overflow-hidden bg-deep md:min-h-full">
        <img
          src={door.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.02]"
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className="flex flex-col justify-end px-10 py-14 sm:px-12 sm:py-16 md:justify-center">
        <p className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ink-subtle">
          {door.meta}
        </p>
        <p className="mt-4 font-serif text-5xl tracking-tight text-ink sm:text-6xl md:text-7xl">
          {door.label}
        </p>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-muted">
          {door.desc}
        </p>
        <p className="mt-6 font-sans text-[0.68rem] uppercase tracking-[0.22em] text-ink-subtle opacity-0 transition-opacity duration-300 group-hover:opacity-70">
          Explore →
        </p>
      </div>
    </Link>
  );
}
