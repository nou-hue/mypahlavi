import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  ArchiveSubnav,
  EmptyState,
  EntryRow,
  PageIntro,
  PlaceholderBanner,
  TEMPLATE_LABEL,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";
import { TEMPLATES } from "@/content/schema.mjs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/archive/entries/")({
  validateSearch: (s: Record<string, unknown>): { template?: string } => ({
    template: typeof s.template === "string" && TEMPLATES.includes(s.template) ? s.template : undefined,
  }),
  head: () =>
    archiveHead({
      path: "/archive/entries",
      title: "Entries",
      description: "Essays, photographs, objects, places and documents — each with its sources.",
    }),
  component: EntriesIndex,
});

function EntriesIndex() {
  const { template } = Route.useSearch();
  const entries = archive.entriesByTemplate(template);
  const all = archive.articles;

  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/entries" />
        {all.length > 0 && all.every((e) => e.status === "placeholder") ? <PlaceholderBanner /> : null}
        <PageIntro kicker="Archive / Entries" title="Entries">
          <p>
            Five kinds of entry share one standard: sources cited, images credited, uncertainty stated.
          </p>
        </PageIntro>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-12 sm:px-12 sm:py-16">
            <div role="group" aria-label="Filter by kind" className="mb-10 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.6rem] uppercase tracking-[0.18em]">
              <Link
                to="/archive/entries"
                className={cn("py-2", !template ? "text-ink underline underline-offset-8" : "text-ink-subtle hover:text-ink")}
              >
                All
              </Link>
              {TEMPLATES.map((t) => (
                <Link
                  key={t}
                  to="/archive/entries"
                  search={{ template: t }}
                  className={cn("py-2", template === t ? "text-ink underline underline-offset-8" : "text-ink-subtle hover:text-ink")}
                >
                  {TEMPLATE_LABEL[t]}
                </Link>
              ))}
            </div>

            {entries.length === 0 ? (
              <EmptyState
                title={template ? `No ${TEMPLATE_LABEL[template]!.toLowerCase()} entries yet.` : "The first entries are in preparation."}
                action={
                  template ? (
                    <Link to="/archive/entries" className="font-sans text-[0.6rem] uppercase tracking-[0.18em] underline underline-offset-8">
                      Show all entries
                    </Link>
                  ) : undefined
                }
              >
                Nothing is published until its sources are cited and its images are cleared.
              </EmptyState>
            ) : (
              <ul className="border-t border-border">
                {entries.map((e) => (
                  <EntryRow key={e.slug} entry={e} />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}
