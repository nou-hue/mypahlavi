import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site-config.mjs";
import { formatDate, isoOf } from "@/content/dates.mjs";
import { canShowImage } from "@/content/rights-gate.mjs";
import { archive } from "@/content/load";
import type { ArchiveCollection, ArchiveEntry, ArchiveEvent, ArchivePlate } from "@/content/load";

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

export const TEMPLATE_LABEL: Record<string, string> = {
  essay: "Essay",
  photograph: "The Photograph",
  object: "The Object",
  place: "The Place",
  document: "The Document",
};

export const CONFIDENCE_LABEL: Record<string, string> = {
  documented: "Documented",
  disputed: "Disputed",
  "to-verify": "To be verified",
};

export const RIGHTS_LABEL: Record<string, string> = {
  "public-domain": "Public domain",
  cc: "Open licence",
  licensed: "Licensed",
  owned: "Owned by MyPahlavi",
  pending: "Rights pending",
  unknown: "Rights not yet researched",
  withdrawn: "Withdrawn at the rights holder’s request",
};

export const ARCHIVE_NAV = [
  { to: "/archive", label: "Overview", exact: true },
  { to: "/archive/entries", label: "Entries" },
  { to: "/archive/collections", label: "Collections" },
  { to: "/archive/timeline", label: "Timeline" },
  { to: "/archive/plates", label: "Plates" },
  { to: "/archive/sources", label: "Sources" },
] as const;

/** Route head for archive pages. Placeholder pages are kept out of search engines. */
export function archiveHead(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Full <title>, used instead of "<title> — MyPahlavi archive" (e.g. seoTitle + " | mypahlavi"). */
  fullTitle?: string;
  jsonLd?: Record<string, unknown>[];
}) {
  const title = opts.fullTitle ?? `${opts.title} — MyPahlavi archive`;
  const url = absoluteUrl(opts.path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta: any[] = [
      { title },
      { name: "description", content: opts.description },
      { property: "og:title", content: title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: opts.description },
      ...(opts.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      ...(opts.noindex ? [] : (opts.jsonLd ?? []).map((j) => ({ "script:ld+json": j }))),
  ];
  return {
    links: opts.noindex ? [] : [{ rel: "canonical", href: url }],
    meta,
  };
}

/* ------------------------------------------------------------------ */
/* Page furniture                                                      */
/* ------------------------------------------------------------------ */

export function ArchiveSubnav({ active }: { active: (typeof ARCHIVE_NAV)[number]["to"] }) {
  return (
    <>
    <nav
      aria-label="Archive sections"
      className="border-b border-border bg-ground"
    >
      <ul className="mx-auto flex max-w-[90rem] gap-x-7 overflow-x-auto px-6 sm:px-12">
        {ARCHIVE_NAV.map((item) => {
          const current = item.to === active;
          return (
            <li key={item.to} className="shrink-0">
              <Link
                to={item.to}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-12 items-center border-b font-sans text-[0.62rem] uppercase tracking-[0.18em] transition-colors",
                  current
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-subtle hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
    {archive.hasReview ? <ReviewBanner /> : null}
    </>
  );
}

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-ground">
      <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ink-subtle">{kicker}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end lg:gap-20">
          <h1 className="text-balance font-serif text-4xl leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            {title}
          </h1>
          {children ? (
            <div className="max-w-xl text-base leading-8 text-ink-muted">{children}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-6 border-b border-border pb-4">
      <h2 className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-ink-subtle">{children}</h2>
      {action}
    </div>
  );
}

export function TextLink({ to, params, children }: { to: string; params?: Record<string, string>; children: ReactNode }) {
  return (
    <Link
      to={to as any}
      params={params as any}
      className="inline-flex items-center gap-2 border-b border-ink/40 pb-0.5 font-sans text-[0.6rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

/** Small label shown on every placeholder record. */
export function PlaceholderMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-accent/40 px-2 py-[3px] font-sans text-[0.5rem] uppercase tracking-[0.2em] text-accent",
        className,
      )}
    >
      Placeholder
    </span>
  );
}

/** Banner for pages built from placeholder records. */
export function PlaceholderBanner({ children }: { children?: ReactNode }) {
  return (
    <div
      role="note"
      className="border-b border-accent/20 bg-accent/[0.04]"
    >
      <p className="mx-auto max-w-[90rem] px-6 py-3 font-sans text-[0.66rem] leading-relaxed tracking-[0.04em] text-accent sm:px-12">
        <strong className="font-medium uppercase tracking-[0.16em]">Placeholder</strong>
        <span className="mx-3 opacity-40" aria-hidden>
          ·
        </span>
        {children ??
          "This page shows layout only. It contains no historical claims and will be replaced by sourced material."}
      </p>
    </div>
  );
}

/** Banner for pages built from records still awaiting editorial sign-off. Shown on previews only. */
export function ReviewBanner({ children }: { children?: ReactNode }) {
  return (
    <div role="note" className="border-b border-accent/20 bg-accent/[0.04]">
      <p className="mx-auto max-w-[90rem] px-6 py-3 font-sans text-[0.66rem] leading-relaxed tracking-[0.04em] text-accent sm:px-12">
        <strong className="font-medium uppercase tracking-[0.16em]">Draft</strong>
        <span className="mx-3 opacity-40" aria-hidden>·</span>
        {children ?? "Preview only. This text is sourced but has not yet been signed off, and is hidden from search engines and from the live site."}
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex max-w-2xl flex-col items-center border border-border px-8 py-16 text-center sm:px-14 sm:py-20",
        className,
      )}
    >
      <span aria-hidden className="mb-8 block h-px w-10 bg-ink/30" />
      <p className="font-serif text-2xl italic leading-snug tracking-[-0.01em] text-ink-soft sm:text-3xl">
        {title}
      </p>
      {children ? <div className="mt-5 max-w-md text-sm leading-7 text-ink-muted">{children}</div> : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

export function DateLabel({ date, className }: { date: Parameters<typeof formatDate>[0]; className?: string }) {
  const iso = isoOf(date);
  const label = formatDate(date);
  return iso && !date?.end && !date?.circa ? (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  ) : (
    <span className={className}>{label}</span>
  );
}

/* ------------------------------------------------------------------ */
/* Plates (rights-aware)                                               */
/* ------------------------------------------------------------------ */

export const plateIsShowable = canShowImage;

/** The image if it is cleared; otherwise an honest, quiet frame saying why not. */
export function PlateFrame({
  plate,
  className,
  compact = false,
}: {
  plate: ArchivePlate;
  className?: string;
  compact?: boolean;
}) {
  const ratio = plate.image?.width && plate.image?.height
    ? { aspectRatio: `${plate.image.width} / ${plate.image.height}` }
    : { aspectRatio: "4 / 5" };

  if (plateIsShowable(plate) && plate.image) {
    return (
      <div className={cn("museum-mat !p-2.5 sm:!p-4", className)}>
        <div className="museum-image-well archive-view-only" style={ratio}>
          <img
            src={plate.image.src}
            srcSet={
              plate.image.variants?.length && plate.image.width
                ? [...plate.image.variants.map((v) => `${v.src} ${v.width}w`), `${plate.image.src} ${plate.image.width}w`].join(", ")
                : undefined
            }
            sizes="(min-width: 1024px) 40rem, 92vw"
            width={plate.image.width}
            height={plate.image.height}
            alt={plate.image.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="h-full w-full select-none object-contain"
          />
        </div>
      </div>
    );
  }

  const reason = plate.image
    ? (RIGHTS_LABEL[plate.rights.status] ?? "Rights not cleared")
    : plate.status === "placeholder"
      ? "Image to come"
      : "Image not yet supplied";

  return (
    <div className={cn("museum-mat !p-2.5 sm:!p-4", className)}>
      <div
        className="relative flex items-center justify-center overflow-hidden bg-ground-elevated"
        style={ratio}
        role="img"
        aria-label={`${plate.title}: ${reason}`}
      >
        <span aria-hidden className="absolute inset-0 opacity-[0.55] [background:repeating-linear-gradient(135deg,transparent_0_11px,color-mix(in_oklab,#100e0c_6%,transparent)_11px_12px)]" />
        <span className="relative px-4 text-center">
          <span className="block font-serif italic text-ink-muted/80 text-base">{reason}</span>
          {!compact && plate.image ? null : null}
        </span>
      </div>
    </div>
  );
}

export function CreditLine({ plate }: { plate: ArchivePlate }) {
  return (
    <p className="font-sans text-[0.56rem] uppercase tracking-[0.14em] text-ink-subtle">
      {plate.credit.line}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

export function EntryRow({ entry }: { entry: ArchiveEntry }) {
  return (
    <li className="border-b border-border">
      <Link
        to="/archive/entries/$slug"
        params={{ slug: entry.slug }}
        className="group grid gap-3 py-7 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-10"
      >
        <span className="font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink-subtle">
          {TEMPLATE_LABEL[entry.template]}
        </span>
        <span>
          <span className="block font-serif text-2xl leading-tight tracking-[-0.015em] transition-opacity group-hover:opacity-60">
            {entry.title}
          </span>
          {entry.standfirst ? (
            <span className="mt-2 block max-w-2xl text-sm leading-7 text-ink-muted">{entry.standfirst}</span>
          ) : null}
        </span>
        <span className="flex items-center gap-4 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-subtle">
          {entry.status === "placeholder" ? <PlaceholderMark /> : null}
          <DateLabel date={entry.date} />
        </span>
      </Link>
    </li>
  );
}

export function CollectionCard({
  collection,
  cover,
  count,
}: {
  collection: ArchiveCollection;
  cover?: ArchivePlate;
  count: number;
}) {
  return (
    <Link
      to="/archive/collections/$slug"
      params={{ slug: collection.slug }}
      className="group block"
    >
      {cover ? (
        <PlateFrame plate={cover} compact className="transition-transform duration-500 group-hover:-translate-y-0.5" />
      ) : (
        <div className="museum-mat !p-2.5 sm:!p-4">
          <div className="flex aspect-[4/5] items-center justify-center bg-ground-elevated">
            <span className="font-serif text-lg italic text-ink-muted/70">No cover yet</span>
          </div>
        </div>
      )}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl leading-tight tracking-[-0.015em] transition-opacity group-hover:opacity-60">
            {collection.title}
          </h3>
          {collection.subtitle ? (
            <p className="mt-1.5 text-sm leading-6 text-ink-muted">{collection.subtitle}</p>
          ) : null}
        </div>
        {collection.status === "placeholder" ? <PlaceholderMark className="shrink-0" /> : null}
      </div>
      <p className="mt-3 font-sans text-[0.56rem] uppercase tracking-[0.18em] text-ink-subtle">
        {count === 0 ? "No items yet" : `${count} ${count === 1 ? "item" : "items"}`}
      </p>
    </Link>
  );
}

export function PlateTile({ plate }: { plate: ArchivePlate }) {
  return (
    <Link to="/archive/plates/$id" params={{ id: plate.id }} className="group block">
      <PlateFrame plate={plate} compact className="transition-transform duration-500 group-hover:-translate-y-0.5" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg leading-snug transition-opacity group-hover:opacity-60">{plate.title}</p>
          <p className="mt-1 font-sans text-[0.56rem] uppercase tracking-[0.16em] text-ink-subtle">
            <DateLabel date={plate.date} />
          </p>
        </div>
        {plate.status === "placeholder" ? <PlaceholderMark className="shrink-0" /> : null}
      </div>
    </Link>
  );
}

const CONFIDENCE_STYLE: Record<string, string> = {
  documented: "text-ink-muted",
  disputed: "text-accent",
  "to-verify": "text-ink-subtle",
};

export function EventItem({ event, showDate = true }: { event: ArchiveEvent; showDate?: boolean }) {
  return (
    <li className="relative grid gap-2 border-b border-border py-7 sm:grid-cols-[9.5rem_1fr] sm:gap-10">
      <p className="font-sans text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">
        {showDate ? <DateLabel date={event.date} /> : null}
        {event.place ? <span className="mt-1 block text-ink-subtle">{event.place}</span> : null}
      </p>
      <div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="font-serif text-2xl leading-tight tracking-[-0.015em]">{event.title}</h3>
          {event.status === "placeholder" ? <PlaceholderMark /> : null}
        </div>
        {event.summary ? <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">{event.summary}</p> : null}
        {event.note ? (
          <details className="group mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
            <summary className="cursor-pointer font-sans text-[0.56rem] uppercase tracking-[0.16em] text-accent marker:content-none">
              {event.confidence === "disputed" ? "Sources differ" : "Evidence note"}
              <span aria-hidden className="ml-2 inline-block transition-transform group-open:rotate-90">›</span>
            </summary>
            <p className="mt-2">{event.note}</p>
          </details>
        ) : null}
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-[0.56rem] uppercase tracking-[0.16em]">
          <span className={CONFIDENCE_STYLE[event.confidence]}>{CONFIDENCE_LABEL[event.confidence]}</span>
          {event.perspective ? <span className="text-ink-subtle">Account: {event.perspective}</span> : null}
          <span className="text-ink-subtle">
            {event.cite.length} {event.cite.length === 1 ? "citation" : "citations"}
          </span>
          {event.entrySlug ? (
            <Link
              to="/archive/entries/$slug"
              params={{ slug: event.entrySlug }}
              className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              Read the entry
            </Link>
          ) : null}
        </p>
      </div>
    </li>
  );
}
