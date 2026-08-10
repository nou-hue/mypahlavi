import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/editions_/$productId")({
  component: ProductPage,
});

/** Individual products paused while the shop is closed. */
function ProductPage() {
  return (
    <LayoutShell>
      <div className="mx-auto flex min-h-[70svh] max-w-lg flex-col items-center justify-center px-5 py-24 text-center">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
          Editions
        </p>
        <h1 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">
          Coming soon
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          This piece is not available yet.
        </p>
        <Link
          to="/editions"
          className="mt-10 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.68rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
        >
          Back
        </Link>
      </div>
    </LayoutShell>
  );
}
