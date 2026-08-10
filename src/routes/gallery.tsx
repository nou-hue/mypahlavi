import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, type SyntheticEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { z } from "zod";
import { LayoutShell } from "@/components/archive/layout-shell";
import { ArchiveImage } from "@/components/archive/archive-image";
import {
  galleryImages,
  gallerySelection,
  rooms,
  getMember,
  type GalleryImage,
} from "@/data/archive";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  room: z.string().optional(),
  id: z.string().optional(),
});

const PAGE = 12;

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
  const initialRoom =
    search.room === "all" || search.room
      ? search.room
      : "selection";
  const [room, setRoom] = useState(initialRoom ?? "selection");
  const [activeId, setActiveId] = useState<string | null>(search.id ?? null);
  const [visible, setVisible] = useState(PAGE);

  const pool = useMemo(() => {
    if (room === "selection") {
      const sel = gallerySelection.length ? gallerySelection : galleryImages.slice(0, 48);
      return sel;
    }
    if (room === "all") return galleryImages;
    return galleryImages.filter((g) => g.room === room);
  }, [room]);

  // Balanced hang: alternate portrait / landscape rhythm when possible
  const ordered = useMemo(() => balanceHang(pool), [pool]);

  const filtered = ordered;
  const shown = filtered.slice(0, visible);
  const activeIndex = filtered.findIndex((g) => g.id === activeId);
  const active = activeIndex >= 0 ? filtered[activeIndex] : null;

  useEffect(() => {
    if (search.id) setActiveId(search.id);
    if (search.room) setRoom(search.room);
  }, [search.id, search.room]);

  useEffect(() => {
    setVisible(PAGE);
  }, [room]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
      if (e.key === "ArrowRight") {
        const next = filtered[(activeIndex + 1) % filtered.length];
        if (next) setActiveId(next.id);
      }
      if (e.key === "ArrowLeft") {
        const prev =
          filtered[(activeIndex - 1 + filtered.length) % filtered.length];
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
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="mx-auto mb-16 max-w-lg space-y-4 text-center archive-rise">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
            Gallery
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Collection
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            A quiet hang. Fewer plates, more air — chosen for presence, not volume.
          </p>
        </header>

        <div className="mb-14 flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
          {rooms.map((r) => {
            const activeRoom = room === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRoom(r.id);
                  setActiveId(null);
                }}
                className={cn(
                  "h-9 px-3.5 font-sans text-[0.65rem] uppercase tracking-[0.16em] transition-colors",
                  activeRoom
                    ? "text-ink"
                    : "text-ink-subtle hover:text-ink",
                )}
              >
                {r.label}
                {activeRoom && (
                  <span className="mt-1 block h-px w-full bg-ink/40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Exclusive grid: 1 col mobile, 2 col desktop, generous gaps, contain = upright full plate */}
        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 sm:gap-y-20">
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              className={cn(
                "group text-left archive-fade",
                // occasional full-width landscape for rhythm
                img.aspect === "landscape" && i % 5 === 0 && "sm:col-span-2 sm:mx-auto sm:max-w-2xl",
              )}
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
            >
              <ArchiveImage
                src={img.src}
                alt={img.title}
                gradient={img.gradient}
                fit="contain"
                rotate={img.rotate ?? 0}
                className={cn(
                  "bg-ground-elevated transition-opacity duration-300 group-hover:opacity-95",
                  img.aspect === "portrait" && "aspect-[3/4]",
                  img.aspect === "landscape" && "aspect-[5/4]",
                  img.aspect === "square" && "aspect-square",
                  !img.aspect && "aspect-[3/4]",
                )}
              />
              <div className="mt-5 space-y-1.5 px-0.5">
                <p className="font-sans text-[0.62rem] uppercase tracking-[0.16em] text-ink-subtle">
                  {img.year}
                  {img.place && img.place !== "Archive"
                    ? ` · ${img.place}`
                    : ""}
                </p>
                <p className="font-serif text-xl leading-snug tracking-tight">
                  {img.title}
                </p>
                {(img.cardCaption || img.caption) && (
                  <p className="line-clamp-2 max-w-md text-sm leading-relaxed text-ink-muted">
                    {img.cardCaption || img.caption}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-24 text-center font-serif text-xl text-ink-muted">
            Nothing in this room yet.
          </p>
        )}

        {visible < filtered.length && (
          <div className="mt-20 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="inline-flex h-11 items-center border border-border px-8 font-sans text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-ink/40 hover:text-ink"
            >
              Show more
            </button>
            <p className="mt-4 font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ink-subtle">
              {Math.min(visible, filtered.length)} of {filtered.length}
            </p>
          </div>
        )}
      </div>

      {active && (
        <Viewer
          image={active}
          index={activeIndex}
          total={filtered.length}
          onClose={() => setActiveId(null)}
          onPrev={() => {
            const prev =
              filtered[(activeIndex - 1 + filtered.length) % filtered.length];
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

/** Mild stagger so consecutive portraits / landscapes don't clump as hard */
function balanceHang(list: GalleryImage[]): GalleryImage[] {
  if (list.length < 4) return list;
  const portraits = list.filter((g) => g.aspect === "portrait");
  const landscapes = list.filter((g) => g.aspect !== "portrait");
  const out: GalleryImage[] = [];
  let i = 0;
  let j = 0;
  while (i < portraits.length || j < landscapes.length) {
    if (i < portraits.length) out.push(portraits[i++]!);
    if (i < portraits.length) out.push(portraits[i++]!);
    if (j < landscapes.length) out.push(landscapes[j++]!);
  }
  return out;
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
  const rot = image.rotate ?? 0;
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-ground text-ink archive-view-only"
      onContextMenu={blockSave}
    >
      <div className="flex items-center justify-between px-5 py-5 sm:px-10">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ink-subtle">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center text-ink-muted hover:text-ink"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-10 sm:px-12">
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-ink-subtle hover:text-ink sm:flex"
          aria-label="Previous"
        >
          <ChevronLeft className="size-6" />
        </button>

        <figure className="flex w-full max-w-3xl flex-col items-center">
          <div
            className="relative w-full overflow-hidden border border-border bg-deep"
            onContextMenu={blockSave}
          >
            {image.src ? (
              <>
                <img
                  src={image.src}
                  alt={image.title}
                  draggable={false}
                  className="mx-auto max-h-[62vh] w-auto max-w-full select-none object-contain"
                  style={
                    rot
                      ? { transform: `rotate(${rot}deg)` }
                      : undefined
                  }
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
              <div
                className={cn("aspect-[3/4] bg-gradient-to-br", image.gradient)}
              />
            )}
          </div>
          <figcaption className="mt-8 max-w-md space-y-3 text-center">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ink-subtle">
              {image.year}
              {image.place && image.place !== "Archive"
                ? ` · ${image.place}`
                : ""}
            </p>
            <h2 className="font-serif text-2xl leading-snug tracking-tight sm:text-3xl">
              {image.title}
            </h2>
            <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
              {image.caption}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {image.personIds.map((id) => {
                const m = getMember(id);
                if (!m) return null;
                return (
                  <Link
                    key={id}
                    to="/lineage"
                    search={{ person: id }}
                    className="border border-border px-3 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.12em] text-ink-subtle hover:border-ink/30 hover:text-ink"
                  >
                    {m.name}
                  </Link>
                );
              })}
            </div>
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={onNext}
          className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-ink-subtle hover:text-ink sm:flex"
          aria-label="Next"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      <div className="flex justify-center gap-10 pb-8 sm:hidden">
        <button
          type="button"
          onClick={onPrev}
          className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle"
        >
          Next
        </button>
      </div>
    </div>
  );
}
