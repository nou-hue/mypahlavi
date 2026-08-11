import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { patronageTiers } from "@/data/archive";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/patronage")({
  component: CirclePage,
});

function CirclePage() {
  return (
    <LayoutShell>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-16 max-w-2xl space-y-5 archive-rise">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            The Circle
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Support the preservation of the archive
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Quiet patronage for digitisation, unpublished releases, and the long
            work of an independent collection — closer to a private cultural
            institution than a membership product.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {patronageTiers.map((tier, i) => (
            <div
              key={tier.id}
              className={cn(
                "flex flex-col border p-6 sm:p-8 archive-fade",
                tier.id === "patron"
                  ? "border-border bg-ground-elevated"
                  : "border-border bg-ground",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ink-subtle">
                {tier.name}
              </p>
              <p className="mt-3 font-serif text-3xl tracking-tight">{tier.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {tier.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.perks.map((perk) => (
                  <li
                    key={perk}
                    className="border-t border-border pt-3 text-sm text-ink-soft"
                  >
                    {perk}
                  </li>
                ))}
              </ul>
              <SignedOut>
                <Link
                  to="/login"
                  className="mt-8 inline-flex h-11 items-center justify-center bg-ink font-sans text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-deep"
                >
                  Sign in to join
                </Link>
              </SignedOut>
              <SignedIn>
                <button
                  type="button"
                  className="mt-8 h-11 bg-ink font-sans text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-deep"
                >
                  Continue as member
                </button>
              </SignedIn>
            </div>
          ))}
        </div>

        <p className="mt-14 max-w-2xl text-sm leading-relaxed text-ink-subtle">
          Circle membership funds conservation-scale work and early access to
          Editions and Vault releases.
        </p>
      </div>
    </LayoutShell>
  );
}
