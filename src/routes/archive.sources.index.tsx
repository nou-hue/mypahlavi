import { createFileRoute } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { SOURCE_TYPE_LABEL, SourceLine } from "@/components/archive-index/entry-template";
import {
  ArchiveSubnav,
  EmptyState,
  PageIntro,
  PlaceholderBanner,
  PlaceholderMark,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/sources/")({
  head: () =>
    archiveHead({
      path: "/archive/sources",
      title: "Sources",
      description: "The bibliography behind everything published in the archive.",
    }),
  component: SourcesIndex,
});

function SourcesIndex() {
  const list = archive.sources;
  const types = [...new Set(list.map((s) => s.type))];
  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/sources" />
        {list.length > 0 && list.every((s) => s.status === "placeholder") ? <PlaceholderBanner /> : null}
        <PageIntro kicker="Archive / Sources" title="Sources">
          <p>
            Every source the archive relies on, with its type, its holder and — for documents and testimony —
            whose perspective it carries. A source is only as neutral as its author.
          </p>
        </PageIntro>
        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            {list.length === 0 ? (
              <EmptyState title="The bibliography will grow with the archive.">
                Every source cited in an entry, plate or event is listed here with a link back to where it is used.
              </EmptyState>
            ) : (
              <div className="space-y-16">
                {types.map((t) => (
                  <section key={t} aria-labelledby={`t-${t}`} className="grid gap-6 lg:grid-cols-[12rem_1fr] lg:gap-14">
                    <h2 id={`t-${t}`} className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-ink-subtle lg:pt-7">
                      {SOURCE_TYPE_LABEL[t]}
                    </h2>
                    <ul className="border-t border-border">
                      {list
                        .filter((s) => s.type === t)
                        .map((s) => {
                          const uses = archive.usesOfSource(s.id);
                          const n = uses.entries.length + uses.plates.length + uses.events.length;
                          return (
                            <li key={s.id} className="flex items-start justify-between gap-6 border-b border-border py-6">
                              <SourceLine source={s} />
                              <span className="flex shrink-0 flex-col items-end gap-2 font-sans text-[0.56rem] uppercase tracking-[0.16em] text-ink-subtle">
                                {s.status === "placeholder" ? <PlaceholderMark /> : null}
                                <span>{n === 0 ? "Not yet cited" : `Cited ${n}×`}</span>
                              </span>
                            </li>
                          );
                        })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}
