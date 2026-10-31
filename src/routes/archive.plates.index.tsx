import { createFileRoute } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  ArchiveSubnav,
  EmptyState,
  PageIntro,
  PlaceholderBanner,
  PlateTile,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/plates/")({
  head: () =>
    archiveHead({
      path: "/archive/plates",
      title: "Plates",
      description: "Images with credit lines, rights status and provenance.",
    }),
  component: PlatesIndex,
});

function PlatesIndex() {
  const list = archive.plates;
  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/plates" />
        {list.length > 0 && list.every((p) => p.status === "placeholder") ? <PlaceholderBanner /> : null}
        <PageIntro kicker="Archive / Plates" title="Plates">
          <p>
            An image is shown only once we know who made it, who holds it and on what terms it may be reproduced.
            Until then its place is kept and its reason for waiting is stated.
          </p>
        </PageIntro>
        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            {list.length === 0 ? (
              <EmptyState title="No plates have been cleared yet.">
                Each plate will appear with its credit line, date and rights status.
              </EmptyState>
            ) : (
              <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((p) => (
                  <PlateTile key={p.id} plate={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}
