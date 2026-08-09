import { cn } from "@/lib/utils";

/** Dark brown museum frame around archival plates */
export function ArchiveImage({
  src,
  alt,
  className,
  gradient = "from-[#1a1612] via-[#3d342c] to-[#0e0c0a]",
  imgClassName,
  framed = true,
}: {
  src?: string;
  alt: string;
  className?: string;
  gradient?: string;
  imgClassName?: string;
  framed?: boolean;
}) {
  const plate = (
    <div
      className={cn(
        "relative overflow-hidden bg-deep",
        !src && `bg-gradient-to-br ${gradient}`,
        !framed && className,
        framed && "h-full w-full",
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full object-cover object-center",
            imgClassName,
          )}
        />
      ) : null}
    </div>
  );

  if (!framed) return plate;

  return (
    <div
      className={cn(
        "archive-frame",
        className,
      )}
    >
      <div className="archive-frame-inner">{plate}</div>
    </div>
  );
}
