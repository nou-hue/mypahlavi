import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { EntryTemplate } from "@/components/archive-index/entry-template";
import { EmptyState, archiveHead } from "@/components/archive-index/ui";
import { archive } from "@/content/load";
import { entryJsonLd } from "@/content/jsonld.mjs";

export const Route = createFileRoute("/archive/entries/$slug")({
  head: ({ params }) => {
    const e = archive.article(params.slug);
    return archiveHead({
      path: `/archive/entries/${params.slug}`,
      title: e?.title ?? "Entry not found",
      fullTitle: e?.seoTitle ? `${e.seoTitle} | mypahlavi` : undefined,
      description: e?.metaDescription ?? e?.standfirst ?? "An entry in the MyPahlavi archive.",
      jsonLd: e ? entryJsonLd(e, `/archive/entries/${params.slug}`) : undefined,
      noindex: !e || e.status !== "published",
    });
  },
  component: EntryPage,
});

function EntryPage() {
  const { slug } = Route.useParams();
  const entry = archive.article(slug);
  return (
    <LayoutShell>
      <main>
        {entry ? (
          <EntryTemplate entry={entry} />
        ) : (
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12">
            <EmptyState
              title="This entry is not in the archive."
              action={
                <Link to="/archive/entries" className="font-sans text-[0.6rem] uppercase tracking-[0.18em] underline underline-offset-8">
                  Browse all entries
                </Link>
              }
            >
              It may not be published yet, or the address may have changed.
            </EmptyState>
          </div>
        )}
      </main>
    </LayoutShell>
  );
}
