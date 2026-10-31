import { archive, type ArchivePlate } from "@/content/load";
import { canShowImage } from "@/content/rights-gate.mjs";
import { cn } from "@/lib/utils";
import { DateLabel, PlateFrame } from "./ui";

/**
 * A picture with its provenance, always.
 *
 * Whether or not the image itself may be shown (see rights-gate.mjs), the
 * figure always prints: the credit line verbatim, the licence (linked to its
 * text when we hold the URL), and a link to the source record. A withheld
 * image keeps all three, and says why it is withheld.
 *
 * Use as <ArchiveFigure plate={plate} /> or <ArchiveFigure id="abadan-1941" />.
 */
export function ArchiveFigure({
  plate: given,
  id,
  caption,
  className,
}: {
  plate?: ArchivePlate;
  id?: string;
  caption?: string;
  className?: string;
}) {
  const plate = given ?? (id ? archive.plate(id.toLowerCase()) : undefined);
  if (!plate) return null;
  const shown = canShowImage(plate);
  const licence = plate.rights.licence ?? RIGHTS_FALLBACK[plate.rights.status];
  const sourceUrl = plate.credit.sourceUrl;
  const pending = !shown && plate.status !== "placeholder";

  return (
    <figure className={cn("museum-plate", className)} data-rights={shown ? "cleared" : "withheld"}>
      <PlateFrame plate={plate} />
      <figcaption className="museum-caption">
        <span className="museum-meta">
          <DateLabel date={plate.date} />
          {plate.place ? ` · ${plate.place}` : ""}
        </span>
        {(caption ?? plate.caption) ? <span className="museum-caption-copy">{caption ?? plate.caption}</span> : null}
        {pending ? (
          <span className="mt-1 inline-block w-fit border border-accent/40 px-2 py-[3px] font-sans text-[0.5rem] uppercase tracking-[0.2em] text-accent">
            Rights check pending · image withheld
          </span>
        ) : null}
        <span className="museum-meta" data-figure-credit>
          {plate.credit.line}
        </span>
        <span className="museum-meta flex flex-wrap gap-x-4 gap-y-1" data-figure-provenance>
          <span>
            Licence:{" "}
            {plate.rights.licenceUrl ? (
              <a href={plate.rights.licenceUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
                {licence}
              </a>
            ) : (
              licence
            )}
          </span>
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
              Source
            </a>
          ) : (
            <span>Source: not recorded</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

const RIGHTS_FALLBACK: Record<string, string> = {
  "public-domain": "Public domain",
  cc: "Open licence",
  licensed: "Licensed",
  owned: "Owned by MyPahlavi",
  pending: "Under review",
  unknown: "Not yet researched",
  withdrawn: "Withdrawn",
};
