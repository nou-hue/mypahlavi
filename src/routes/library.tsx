import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutShell } from "@/components/archive/layout-shell";
import { libraryItems, type LibraryItem } from "@/data/archive";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

const kinds = [
  { id: "all", label: "All" },
  { id: "letter", label: "Letters" },
  { id: "essay", label: "Essays" },
  { id: "book", label: "Books" },
] as const;

function LibraryPage() {
  const [kind, setKind] = useState<string>("all");
  const [activeId, setActiveId] = useState(libraryItems[0]?.id ?? "");

  const filtered = useMemo(() => {
    if (kind === "all") return libraryItems;
    return libraryItems.filter((i) => i.kind === kind);
  }, [kind]);

  const active =
    filtered.find((i) => i.id === activeId) ?? filtered[0] ?? null;

  return (
    <LayoutShell>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-12 max-w-2xl space-y-5 archive-rise">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            The Library
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Reading room
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Essays, letters, and publications for slow attention — museum
            catalogue and independent journal, not a content feed.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setKind(k.id);
                const first = libraryItems.find(
                  (i) => k.id === "all" || i.kind === k.id,
                );
                if (first) setActiveId(first.id);
              }}
              className={cn(
                "h-10 px-4 font-sans text-[0.65rem] uppercase tracking-[0.16em] transition-colors",
                kind === k.id
                  ? "text-ink"
                  : "text-ink-subtle hover:text-ink",
              )}
            >
              <span className="relative">
                {k.label}
                {kind === k.id && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-ink/40" />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <aside className="space-y-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "w-full border px-4 py-4 text-left transition-colors",
                  active?.id === item.id
                    ? "border-accent/40 bg-ground-elevated"
                    : "border-border hover:border-ink/20",
                )}
              >
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  {item.kind} · {item.year}
                </p>
                <p className="mt-1 font-serif text-lg leading-snug">{item.title}</p>
              </button>
            ))}
          </aside>

          {active && <ReadingPane item={active} />}
        </div>
      </div>
    </LayoutShell>
  );
}

function ReadingPane({ item }: { item: LibraryItem }) {
  return (
    <article className="border border-border bg-cream px-6 py-8 sm:px-10 sm:py-12 archive-fade">
      <p className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-ink-subtle">
        {item.kind} · {item.year}
      </p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
        {item.title}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{item.author}</p>
      <p className="mt-6 border-l-2 border-accent/40 pl-4 font-serif text-lg italic leading-relaxed text-ink-soft">
        {item.excerpt}
      </p>
      <div className="mt-8 max-w-prose space-y-5 font-serif text-[1.05rem] leading-[1.75] text-ink-soft">
        {item.body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        {item.tags.map((t) => (
          <span
            key={t}
            className="border border-border px-2.5 py-1 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-ink-subtle"
          >
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}
