import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type SyntheticEvent } from "react";
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

function blockSave(e: SyntheticEvent | Event) {
  e.preventDefault();
  e.stopPropagation();
}

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
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
    };
    const onCtx = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(".archive-view-only")) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onCtx);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onCtx);
      document.body.style.overflow = prev;
    };
  }, [active, activeIndex, filtered]);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="mb-12 max-w-xl space-y-3 archive-rise">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
            Gallery · {galleryImages.length}
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Collection
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Photographs of the Pahlavi family across three generations — state,
            private life, and the long afterimage of a dynasty.
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
                  "h-9 px-3.5 font-sans text-[0.65rem] uppercase tracking-[0.14em] transition-colors",
                  room === r.id
                    ? "bg-ink text-cream"
                    : "border border-border text-ink-muted hover:border-ink/30",
                )}
              >
                {r.label}
                <span className="ml-1.5 opacity-45">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              className="group text-left archive-fade"
              style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
            >
              <ArchiveImage
                src={img.src}
                alt={img.title}
                gradient={img.gradient}
                className={cn(
                  "transition-opacity duration-300 group-hover:opacity-90",
                  img.aspect === "portrait" && "aspect-[3/4]",
                  img.aspect === "landscape" && "aspect-[4/3]",
                  img.aspect === "square" && "aspect-square",
                  !img.aspect && "aspect-[3/4]",
                )}
              />
              <div className="mt-3 space-y-1">
                <p className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ink-subtle">
                  {img.year}
                  {img.place && img.place !== "Archive" ? ` · ${img.place}` : ""}
                </p>
                <p className="font-serif text-lg leading-snug">{img.title}</p>
                <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
                  {img.cardCaption || img.caption}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-ink-muted">No images in this room.</p>
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
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-deep text-cream archive-view-only"
      onContextMenu={blockSave}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-cream/40">
          {index + 1} — {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center text-cream/60 hover:text-cream"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 sm:px-10">
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/40 hover:text-cream sm:flex"
          aria-label="Previous"
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div
            className="relative mx-auto w-full max-w-md overflow-hidden bg-black/30 lg:max-w-lg"
            onContextMenu={blockSave}
          >
            {image.src ? (
              <>
                <img
                  src={image.src}
                  alt={image.title}
                  draggable={false}
                  className="mx-auto max-h-[68vh] w-auto max-w-full select-none object-contain"
                  onContextMenu={blockSave}
                  onDragStart={blockSave}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 z-[2]"
                  onContextMenu={blockSave}
                />
              </>
            ) : (
              <div className={cn("aspect-[3/4] bg-gradient-to-br", image.gradient)} />
            )}
          </div>
          <div className="w-full max-w-sm space-y-4 archive-fade lg:pb-4">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent-soft">
              {image.year}
              {image.place && image.place !== "Archive" ? ` · ${image.place}` : ""}
            </p>
            <h2 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
              {image.title}
            </h2>
            <p className="text-base leading-relaxed text-cream/70">{image.caption}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {image.personIds.map((id) => {
                const m = getMember(id);
                if (!m) return null;
                return (
                  <Link
                    key={id}
                    to="/lineage"
                    search={{ person: id }}
                    className="border border-cream/15 px-3 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.12em] text-cream/55 hover:border-cream/40 hover:text-cream"
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
          className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/40 hover:text-cream sm:flex"
          aria-label="Next"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      <div className="flex justify-center gap-8 pb-6 sm:hidden">
        <button type="button" onClick={onPrev} className="text-sm text-cream/50">
          Prev
        </button>
        <button type="button" onClick={onNext} className="text-sm text-cream/50">
          Next
        </button>
      </div>
    </div>
  );
}
