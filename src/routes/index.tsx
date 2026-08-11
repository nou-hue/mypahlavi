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

/**
 * Asymmetric room layouts — image as artifact, not full-bleed wallpaper.
 * existing image assets only; presentation is scale + whitespace.
 */
type RoomLayout =
  | "plate-center"
  | "plate-left"
  | "plate-right"
  | "plate-narrow"
  | "plate-offset";

const roomLayouts: Record<string, RoomLayout> = {
  people: "plate-center",
  places: "plate-right",
  culture: "plate-left",
  modernity: "plate-narrow",
  memory: "plate-offset",
  objects: "plate-narrow",
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
    }, 9000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] ?? slides[0];

  return (
    <LayoutShell>
      {/* 01 HERO — framed plate in cream room, not edge-to-edge background */}
      <section className="bg-ground">
        <div className="mx-auto flex min-h-[88svh] max-w-[90rem] flex-col items-center justify-center px-6 pb-16 pt-[calc(2rem+var(--grok-banner-h,0px))] sm:px-12 sm:pb-24 sm:pt-8">
          <div className="w-full max-w-[42rem] archive-rise sm:max-w-[48rem] lg:max-w-[52rem]">
            {/* Image plate — ~55–70% of wide viewports via max-width */}
            <div className="archive-view-only relative mx-auto overflow-hidden border border-border/50 bg-deep shadow-soft">
              {slides.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.caption}
                  draggable={false}
                  className={cn(
                    "hero-crossfade aspect-[4/5] w-full select-none object-cover sm:aspect-[5/6]",
                    i === index
                      ? "relative opacity-100"
                      : "absolute inset-0 opacity-0",
                  )}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 text-center sm:mt-10">
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
                {active?.meta}
              </p>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-ink-muted transition-colors hover:text-ink"
              >
                {siteCopy.ctaPrimary}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Institutional statement — narrow column, breathing room */}
      <section className="bg-ground">
        <div className="mx-auto max-w-md px-8 py-24 text-center sm:py-32 md:py-40">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.36em] text-ink-subtle">
            Independent archive
          </p>
          <h1 className="mt-8 font-serif text-3xl leading-[1.25] tracking-tight text-ink sm:text-4xl">
            {siteCopy.positioning}
          </h1>
          <p className="mx-auto mt-8 text-sm leading-[1.75] text-ink-muted">
            Documenting the people, culture, images and modern history
            surrounding the Pahlavi era and its continuing legacy.
          </p>
        </div>
      </section>

      {/* 03 Rooms — one carefully framed plate each, generous pause */}
      <section className="bg-ground">
        <div className="mx-auto max-w-[90rem] space-y-0 px-6 sm:px-12">
          {doors.map((door, i) => (
            <EditorialRoom
              key={door.id}
              door={door}
              layout={roomLayouts[door.id] ?? "plate-left"}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* 04 Method — quiet type, not billboard */}
      <section className="border-y border-border bg-ground">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-10 gap-y-6 px-8 py-20 sm:gap-x-14 sm:py-28">
          {["Preserve", "Document", "Contextualise", "Curate"].map((word) => (
            <p
              key={word}
              className="font-serif text-xl tracking-tight text-ink-soft sm:text-2xl"
            >
              {word}
            </p>
          ))}
        </div>
      </section>

      {/* 05 Rooms index — typography first */}
      <section className="bg-ground">
        <div className="mx-auto max-w-3xl px-8 py-24 sm:py-32">
          <p className="mb-3 font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ink-subtle">
            Enter
          </p>
          <p className="mb-16 font-serif text-2xl tracking-tight text-ink sm:text-3xl">
            Rooms of the archive
          </p>
          <div className="space-y-0 border-t border-border">
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
                className="group flex flex-col gap-1 border-b border-border py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <p className="font-serif text-2xl tracking-tight transition-opacity group-hover:opacity-55 sm:text-[1.65rem]">
                  {s.label}
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-ink-muted sm:text-right">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 06 Catalogue metadata — small */}
      {stats && (
        <section className="border-t border-border bg-ground">
          <div className="mx-auto max-w-3xl px-8 py-20 sm:py-24">
            <p className="mb-10 font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ink-subtle">
              Currently in the archive
            </p>
            <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
              {stats.items.map((item) => (
                <div key={item.place} className="space-y-2">
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.18em] text-ink-subtle">
                    {item.place}
                  </p>
                  <p className="font-serif text-lg tracking-tight text-ink-muted sm:text-xl">
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
  index,
}: {
  door: Door;
  layout: RoomLayout;
  index: number;
}) {
  const href = door.href as
    | "/gallery"
    | "/lineage"
    | "/library"
    | "/vault"
    | "/editions"
    | "/patronage";

  // Image plate max widths — deliberately medium, never full viewport
  const plateWidth =
    layout === "plate-narrow"
      ? "max-w-[16rem] sm:max-w-[18rem] md:max-w-[20rem]"
      : layout === "plate-center"
        ? "max-w-[18rem] sm:max-w-[22rem] md:max-w-[26rem]"
        : "max-w-[17rem] sm:max-w-[20rem] md:max-w-[24rem]";

  const align =
    layout === "plate-right"
      ? "md:items-end md:text-right"
      : layout === "plate-offset"
        ? "md:items-center"
        : layout === "plate-center"
          ? "items-center text-center"
          : "md:items-start";

  const imageOrder =
    layout === "plate-right"
      ? "md:flex-row-reverse"
      : layout === "plate-left" || layout === "plate-narrow"
        ? "md:flex-row"
        : "md:flex-col";

  const sectionPad =
    index % 2 === 0
      ? "py-20 sm:py-28 md:py-32"
      : "py-24 sm:py-32 md:py-40";

  return (
    <Link
      to={href}
      className={cn(
        "group flex flex-col gap-10 border-t border-border/60",
        sectionPad,
        imageOrder,
        layout === "plate-center" || layout === "plate-offset"
          ? "md:gap-12"
          : "md:items-center md:justify-between md:gap-16 lg:gap-24",
      )}
    >
      {/* Text column */}
      <div
        className={cn(
          "flex flex-col justify-center",
          layout === "plate-center" || layout === "plate-offset"
            ? "order-2 mx-auto max-w-sm"
            : "order-2 max-w-xs md:order-none md:max-w-[15rem] lg:max-w-[17rem]",
          align,
        )}
      >
        <p className="font-sans text-[0.55rem] uppercase tracking-[0.26em] text-ink-subtle">
          {door.meta}
        </p>
        <p className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
          {door.label}
        </p>
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed text-ink-muted",
            (layout === "plate-center" || layout === "plate-offset") &&
              "mx-auto",
          )}
        >
          {door.desc}
        </p>
        <p className="mt-6 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink-subtle opacity-0 transition-opacity duration-300 group-hover:opacity-70">
          Enter room →
        </p>
      </div>

      {/* Image as artifact — framed plate, existing src only */}
      <div
        className={cn(
          "w-full",
          plateWidth,
          layout === "plate-center" && "order-1 mx-auto",
          layout === "plate-offset" && "order-1 mx-auto md:ml-[12%] md:mr-auto",
          (layout === "plate-left" || layout === "plate-narrow") &&
            "order-1 md:order-none",
          layout === "plate-right" && "order-1 md:order-none",
        )}
      >
        <div className="overflow-hidden border border-border/50 bg-deep shadow-soft">
          <img
            src={door.src}
            alt=""
            className="aspect-[3/4] w-full object-cover transition-opacity duration-700 group-hover:opacity-90"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </Link>
  );
}
