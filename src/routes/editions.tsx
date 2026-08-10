import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/editions")({
  component: ShopPage,
});

function ShopPage() {
  return (
    <LayoutShell>
      <div className="mx-auto flex min-h-[70svh] max-w-lg flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle archive-rise">
          Editions
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl archive-rise">
          Coming soon
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-muted archive-rise">
          The atelier is closed while the next collection is prepared. A short
          release will open here when it is ready.
        </p>
        <Link
          to="/"
          className="mt-12 inline-flex h-11 items-center border border-border px-7 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Home
        </Link>
      </div>
    </LayoutShell>
  );
}
