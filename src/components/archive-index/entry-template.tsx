import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { archive, type ArchiveEntry, type ArchiveSource } from "@/content/load";
import { cn } from "@/lib/utils";
import {
  DateLabel,
  PlaceholderBanner,
  PlaceholderMark,
  PlateFigure,
  SectionHeading,
  TEMPLATE_LABEL,
} from "./ui";

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  primary: "Primary source",
  "archive-record": "Archive record",
  "oral-history": "Oral history",
  secondary: "Scholarship",
  reference: "Reference work",
  periodical: "Periodical",
};

export function SourceLine({ source, locator }: { source: ArchiveSource; locator?: string }) {
  const by = [source.creator, source.institution ?? source.publisher].filter(Boolean).join(" · ");
  return (
    <span className="block">
      <span className="font-serif text-lg leading-snug text-ink">
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
          >
            {source.title}
          </a>
        ) : (
          source.title
        )}
      </span>
      <span className="mt-1 block font-sans text-[0.56rem] uppercase tracking-[0.15em] text-ink-subtle">
        {SOURCE_TYPE_LABEL[source.type]}
        {by ? ` · ${by}` : ""}
        {locator ? ` · ${locator}` : ""}
      </span>
      {source.perspective ? (
        <span className="mt-1 block text-xs leading-6 text-ink-muted">Perspective: {source.perspective}</span>
      ) : null}
    </span>
  );
}

function Cites({ numbers }: { numbers: number[] }) {
  if (numbers.length === 0) return null;
  return (
    <sup className="ml-0.5 font-sans text-[0.6rem] tracking-normal">
      {numbers.map((n, i) => (
        <a
          key={n}
          href={`#note-${n}`}
          id={`cite-${n}-${i}`}
          aria-label={`Source ${n}`}
          className="px-[1px] text-accent no-underline hover:underline"
        >
          {i > 0 ? "," : ""}
          {n}
        </a>
      ))}
    </sup>
  );
}

function Facts({ facts, inline = false }: { facts: ArchiveEntry["facts"]; inline?: boolean }) {
  if (facts.length === 0) return null;
  return (
    <dl
      className={cn(
        inline
          ? "grid gap-x-10 gap-y-5 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-4"
          : "divide-y divide-border border-y border-border",
      )}
    >
      {facts.map((f) => (
        <div key={f.label} className={cn(inline ? "" : "grid grid-cols-[7.5rem_1fr] gap-4 py-3.5")}>
          <dt className="font-sans text-[0.56rem] uppercase tracking-[0.18em] text-ink-subtle">{f.label}</dt>
          <dd className={cn("text-sm leading-6 text-ink-soft", inline && "mt-1.5")}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Body({ entry }: { entry: ArchiveEntry }) {
  const { numbered } = archive.citationsFor(entry);
  return (
    <div className="max-w-[36rem] space-y-6 font-serif text-[1.1rem] leading-[1.85] text-ink-soft">
      {entry.body.map((b, i) => {
        switch (b.type) {
          case "heading":
            return (
              <h2 key={i} className="pt-6 font-serif text-2xl leading-tight tracking-[-0.015em] text-ink">
                {b.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i}>
                {b.text}
                <Cites numbers={numbered[i] ?? []} />
              </p>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-10 border-l border-accent/50 pl-6">
                <p className="font-serif text-xl italic leading-[1.7] text-ink">
                  “{b.text}”
                  <Cites numbers={numbered[i] ?? []} />
                </p>
                <footer className="mt-3 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                  {b.speaker}
                </footer>
              </blockquote>
            );
          case "note":
            return (
              <aside
                key={i}
                className={cn(
                  "my-8 border px-6 py-5 font-sans text-[0.86rem] leading-7",
                  b.tone === "caveat" ? "border-accent/30 text-ink-soft" : "border-border text-ink-muted",
                )}
              >
                <p className="mb-1.5 text-[0.56rem] uppercase tracking-[0.2em] text-ink-subtle">
                  {b.tone === "perspective" ? "Whose account" : b.tone === "caveat" ? "A caution" : "Context"}
                </p>
                {b.text}
                <Cites numbers={numbered[i] ?? []} />
              </aside>
            );
          case "plate": {
            const plate = archive.plate(b.plateId);
            return plate ? (
              <div key={i} className="my-10 max-w-[26rem] font-sans">
                <PlateFigure plate={{ ...plate, caption: b.caption ?? plate.caption }} />
              </div>
            ) : null;
          }
        }
      })}
    </div>
  );
}

function Notes({ entry }: { entry: ArchiveEntry }) {
  const { notes, reading } = archive.citationsFor(entry);
  if (notes.length === 0 && reading.length === 0) return null;
  return (
    <section aria-labelledby="sources-heading" className="mt-20 border-t border-border pt-10">
      <h2 id="sources-heading" className="sr-only">
        Sources
      </h2>
      {notes.length > 0 && (
        <>
          <SectionHeading>Sources cited</SectionHeading>
          <ol className="space-y-6">
            {notes.map((n) => (
              <li key={n.n} id={`note-${n.n}`} className="grid scroll-mt-28 grid-cols-[2rem_1fr] gap-2">
                <span className="font-sans text-[0.62rem] text-accent">{n.n}</span>
                {n.source ? <SourceLine source={n.source} locator={n.locator} /> : null}
              </li>
            ))}
          </ol>
        </>
      )}
      {reading.length > 0 && (
        <div className={notes.length > 0 ? "mt-14" : ""}>
          <SectionHeading>Further reading</SectionHeading>
          <ul className="space-y-6">
            {reading.map((r) => (
              <li key={r.source!.id}>
                <SourceLine source={r.source!} locator={r.locator} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Header({ entry }: { entry: ArchiveEntry }) {
  return (
    <header className="archive-rise">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-subtle">
        <span>{TEMPLATE_LABEL[entry.template]}</span>
        <span aria-hidden>·</span>
        <DateLabel date={entry.date} />
        {entry.place ? (
          <>
            <span aria-hidden>·</span>
            <span>{entry.place}</span>
          </>
        ) : null}
        {entry.status === "placeholder" ? <PlaceholderMark /> : null}
      </p>
      <h1 className="mt-6 text-balance font-serif text-4xl leading-[1.04] tracking-[-0.03em] sm:text-5xl">
        {entry.title}
      </h1>
      {entry.standfirst ? (
        <p className="mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-ink-soft">{entry.standfirst}</p>
      ) : null}
      {(entry.byline || entry.reviewedBy) && (
        <p className="mt-6 font-sans text-[0.56rem] uppercase tracking-[0.18em] text-ink-subtle">
          {entry.byline}
          {entry.reviewedBy ? ` · Reviewed by ${entry.reviewedBy}` : ""}
          {entry.updated ? ` · Updated ${entry.updated}` : ""}
        </p>
      )}
    </header>
  );
}

function Related({ entry }: { entry: ArchiveEntry }) {
  const inCollections = archive.collectionsContaining("entry", entry.slug);
  const events = archive.events.filter((e) => e.entrySlug === entry.slug);
  if (inCollections.length === 0 && events.length === 0) return null;
  return (
    <section className="mt-16 border-t border-border pt-10">
      {inCollections.length > 0 && (
        <>
          <SectionHeading>In collections</SectionHeading>
          <ul className="space-y-3">
            {inCollections.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/archive/collections/$slug"
                  params={{ slug: c.slug }}
                  className="font-serif text-xl underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {events.length > 0 && (
        <div className={inCollections.length ? "mt-12" : ""}>
          <SectionHeading>On the timeline</SectionHeading>
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="font-serif text-xl">
                {e.title} <span className="font-sans text-[0.56rem] uppercase tracking-[0.16em] text-ink-subtle">· <DateLabel date={e.date} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function EntryTemplate({ entry }: { entry: ArchiveEntry }) {
  const plates = entry.plateIds.map((id) => archive.plate(id)).filter(Boolean);
  const lead = plates[0];
  const moreResolved = plates.slice(1);

  let layout: ReactNode;

  if (entry.template === "photograph" || entry.template === "object") {
    layout = (
      <>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-20">
          <div>{lead ? <PlateFigure plate={lead} className="archive-fade" /> : null}</div>
          <div className="lg:pt-6">
            <Header entry={entry} />
            <div className="mt-10">
              <Facts facts={entry.facts} />
            </div>
          </div>
        </div>
        <div className="mt-20 border-t border-border pt-12">
          <Body entry={entry} />
        </div>
      </>
    );
  } else if (entry.template === "document") {
    layout = (
      <div className="grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-20">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="mb-4 font-sans text-[0.56rem] uppercase tracking-[0.22em] text-ink-subtle">Document record</p>
          <Facts facts={entry.facts} />
        </aside>
        <div>
          <Header entry={entry} />
          <div className="mt-14 border-t border-border pt-12">
            <Body entry={entry} />
          </div>
        </div>
      </div>
    );
  } else if (entry.template === "place") {
    layout = (
      <>
        <div className="max-w-3xl">
          <Header entry={entry} />
        </div>
        <div className="mt-12">
          <Facts facts={entry.facts} inline />
        </div>
        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-20">
          <Body entry={entry} />
          {lead ? <PlateFigure plate={lead} /> : null}
        </div>
      </>
    );
  } else {
    layout = (
      <>
        <div className="max-w-3xl">
          <Header entry={entry} />
        </div>
        {lead ? <div className="my-14 max-w-[26rem]"><PlateFigure plate={lead} /></div> : <div className="h-14" />}
        {entry.facts.length > 0 && (
          <div className="mb-12 max-w-xl">
            <Facts facts={entry.facts} />
          </div>
        )}
        <div className="border-t border-border pt-12">
          <Body entry={entry} />
        </div>
      </>
    );
  }

  return (
    <article>
      {entry.status === "placeholder" ? <PlaceholderBanner /> : null}
      <div className="mx-auto max-w-[90rem] px-6 py-14 sm:px-12 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-12 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
          <Link to="/archive" className="hover:text-ink">Archive</Link>
          <span className="mx-3" aria-hidden>/</span>
          <Link to="/archive/entries" className="hover:text-ink">Entries</Link>
        </nav>
        {layout}
        {moreResolved.length > 0 && entry.template !== "essay" ? (
          <section className="mt-16 border-t border-border pt-10">
            <SectionHeading>More plates</SectionHeading>
            <div className="grid max-w-3xl gap-10 sm:grid-cols-2">
              {moreResolved.map((p) => p && <PlateFigure key={p.id} plate={p} />)}
            </div>
          </section>
        ) : null}
        <div className="max-w-3xl">
          <Notes entry={entry} />
          <Related entry={entry} />
        </div>
      </div>
    </article>
  );
}
