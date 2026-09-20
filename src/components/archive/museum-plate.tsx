import { cn } from "@/lib/utils";

export function MuseumPlate({
  src,
  alt,
  meta,
  caption,
  className,
  imageClassName,
  contain = true,
}: {
  src: string;
  alt: string;
  meta?: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
  contain?: boolean;
}) {
  return (
    <figure className={cn("museum-plate", className)}>
      <div className="museum-mat">
        <div className="museum-image-well archive-view-only">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "h-full w-full select-none",
              contain ? "object-contain" : "object-cover",
              imageClassName,
            )}
          />
        </div>
      </div>
      {(meta || caption) && (
        <figcaption className="museum-caption">
          {meta && <span className="museum-meta">{meta}</span>}
          {caption && <span className="museum-caption-copy">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
