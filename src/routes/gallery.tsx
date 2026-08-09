import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { z } from "zod";
import { LayoutShell } from "@/components/archive/layout-shell";
import { ArchiveImage } from "@/components/archive/archive-image";
import { galleryImages, rooms, getMember, type GalleryImage } from "@/data/archive";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  room: z.string().optional(),
  id: z.string().optional(),
});

export const Route = createFileRoute("/gallery")({
  validateSearch: searchSchema,
  component: GalleryPage,
});

function GalleryPage() {
  const search = Route.useSearch();
  const [room, setRoom] = useState(search.room ?? "all");
  const [activeId, setActiveId] = useState<string | null>(search.id ?? null);

  const filtered = useMemo(() => {
    if (room === "all") return galleryImages;
    return galleryImages.filter((g) => g.room === room);
  }, [room]);

  const activeIndex = filtered.findIndex((g) => g.id === activeId);
  const active = activeIndex >= 0 ? filtered[activeIndex] : null;

  useEffect(() => {
    if (search.id) setActiveId(search.id);
    if (search.room) setRoom(search.room);
  }, [search.id, search.room]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
      if (e.key === "ArrowRight") {
        const next = filtered[(activeIndex + 1) % filtered.length];
        if (next) setActiveId(next.id);
      }
      if (e.key === "ArrowLeft") {
        const prev = filtered[(activeIndex - 1 + filtered.length) % filtered.length];
        if (prev) setActiveId(prev.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activeIndex, filtered]);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10 max-w-2xl space-y-4 archive-rise">
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
            Gallery · {galleryImages.length} plates
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Exhibition rooms
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Plates in dark brown frames. Wall labels written with care. Open any image
            for the full reading — arrow keys to walk the room.
          </p>
        </header>

        <div className="mb-10 flex flex-wrap gap-2">
          {rooms.map((r) => {
            const count =
              r.id === "all"
                ? galleryImages.length
                : galleryImages.filter((g) => g.room === r.id).length;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRoom(r.id);
                  setActiveId(null);
                }}
                className={cn(
                  "h-10 px-4 font-sans text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                  room === r.id
                    ? "bg-ink text-cream"
                    : "border border-border text-ink-muted hover:border-ink/30",
                )}
              >
                {r.label}
                <span className="ml-2 opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              className="group text-left archive-fade"
              style={{ animationDelay: `${Math.min(i, 24) * 30}ms` }}
            >
              <ArchiveImage
                src={img.src}
                alt={img.title}
                gradient={img.gradient}
                className={cn(
                  "transition-transform duration-500 group-hover:scale-[1.01]",
                  img.aspect === "portrait" && "aspect-[3/4]",
                  img.aspect === "landscape" && "aspect-[4/3]",
                  img.aspect === "square" && "aspect-square",
                  !img.aspect && "aspect-[4/3]",
                )}
              />
              <div className="mt-3 space-y-2 border-t border-border/80 pt-3">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  {img.year}
                  {img.place ? ` · ${img.place}` : ""}
                </p>
                <p className="font-serif text-xl leading-snug">{img.title}</p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {img.cardCaption || img.caption}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-ink-muted">No plates in this room yet.</p>
        )}
      </div>

      {active && (
        <Viewer
          image={active}
          index={activeIndex}
          total={filtered.length}
          onClose={() => setActiveId(null)}
          onPrev={() => {
            const prev = filtered[(activeIndex - 1 + filtered.length) % filtered.length];
            if (prev) setActiveId(prev.id);
          }}
          onNext={() => {
            const next = filtered[(activeIndex + 1) % filtered.length];
            if (next) setActiveId(next.id);
          }}
        />
      )}
    </LayoutShell>
  );
}

function Viewer({
  image,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  image: GalleryImage;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-deep text-cream">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-cream/50">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center text-cream/70 hover:text-cream"
          aria-label="Close viewer"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-10">
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/50 hover:text-cream sm:flex"
          aria-label="Previous"
        >
          <ChevronLeft className="size-7" />
        </button>

        <div className="flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-end">
          <div
            className={cn(
              "w-full overflow-hidden bg-black/40 shadow-soft",
              image.aspect === "portrait" && "max-h-[72vh] lg:max-w-md",
              image.aspect === "landscape" && "max-h-[68vh]",
              image.aspect === "square" && "max-h-[68vh] lg:max-w-lg",
            )}
          >
            {image.src ? (
              <img
                src={image.src}
                alt={image.caption || image.title}
                className="max-h-[72vh] w-full object-contain"
              />
            ) : (
              <div className={cn("aspect-[4/3] bg-gradient-to-br", image.gradient)} />
            )}
          </div>
          <div className="max-w-md space-y-4 archive-fade">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-accent-soft">
              Wall label · {image.year}
              {image.place ? ` · ${image.place}` : ""}
            </p>
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{image.title}</h2>
            <p className="font-serif text-lg leading-relaxed text-cream/80">
              {image.caption}
            </p>
            <p className="text-xs leading-relaxed text-cream/40">{image.sourceNote}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {image.personIds.map((id) => {
                const m = getMember(id);
                if (!m) return null;
                return (
                  <Link
                    key={id}
                    to="/lineage"
                    search={{ person: id }}
                    className="border border-cream/20 px-3 py-1.5 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-cream/70 hover:border-cream/50 hover:text-cream"
                  >
                    {m.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/50 hover:text-cream sm:flex"
          aria-label="Next"
        >
          <ChevronRight className="size-7" />
        </button>
      </div>

      <div className="flex justify-center gap-6 pb-6 sm:hidden">
        <button type="button" onClick={onPrev} className="text-sm text-cream/60">
          Previous
        </button>
        <button type="button" onClick={onNext} className="text-sm text-cream/60">
          Next
        </button>
      </div>
    </div>
  );
}
