import type { SyntheticEvent } from "react";
import { cn } from "@/lib/utils";

function blockSave(e: SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

/** Editorial plate — thin border, view-protected */
export function ArchiveImage({
  src,
  alt,
  className,
  gradient = "from-[#1a1612] via-[#3d342c] to-[#0e0c0a]",
  imgClassName,
  framed = true,
  fit = "cover",
}: {
  src?: string;
  alt: string;
  className?: string;
  gradient?: string;
  imgClassName?: string;
  framed?: boolean;
  fit?: "cover" | "contain";
}) {
  const plate = (
    <div
      className={cn(
        "relative overflow-hidden bg-deep archive-view-only",
        !src && `bg-gradient-to-br ${gradient}`,
        !framed && className,
        framed && "h-full w-full",
      )}
      onContextMenu={blockSave}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onDragStart={blockSave}
            onContextMenu={blockSave}
            className={cn(
              "pointer-events-none h-full w-full select-none object-center",
              fit === "contain" ? "object-contain" : "object-cover",
              imgClassName,
            )}
          />
          <span
            aria-hidden
            className="absolute inset-0 z-[1] cursor-default"
            onContextMenu={blockSave}
            onDragStart={blockSave}
          />
        </>
      ) : null}
    </div>
  );

  if (!framed) return plate;

  return (
    <div className={cn("archive-frame", className)} onContextMenu={blockSave}>
      <div className="archive-frame-inner">{plate}</div>
    </div>
  );
}
