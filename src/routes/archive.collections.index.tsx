import { createFileRoute } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  ArchiveSubnav,
  CollectionCard,
  EmptyState,
  PageIntro,
  PlaceholderBanner,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/collections/")({
  head: () =>
    archiveHead({
      path: "/archive/collections",
      // Thin until something is published here.
      noindex: !archive.collections.some((r) => r.status === "published"),
      title: "Collections",
      description: "Curated groups of entries, plates and events, each with a note on how it was assembled.",
    }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  const list = archive.collections;
  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/collections" />
        {list.length > 0 && list.every((c) => c.status === "placeholder") ? <PlaceholderBanner /> : null}
        <PageIntro kicker="Archive / Collections" title="Collections">
          <p>
            A collection follows one thread through the archive and says plainly how it was assembled — and what
            the surviving record leaves out.
          </p>
        </PageIntro>
        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            {list.length === 0 ? (
              <EmptyState title="Collections will gather here.">
                When the first is published it will appear with its cover plate, a curator’s note and every item it
                holds.
              </EmptyState>
            ) : (
              <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c) => (
                  <CollectionCard
                    key={c.slug}
                    collection={c}
                    cover={c.coverPlateId ? archive.plate(c.coverPlateId) : undefined}
                    count={c.members.length}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}
