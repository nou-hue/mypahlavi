import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { patronageTiers } from "@/data/archive";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/patronage")({
  component: PatronagePage,
});

function PatronagePage() {
  return (
    <LayoutShell>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-12 max-w-2xl space-y-4 archive-rise">
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
            Patronage
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Support the archive
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Subscriptions framed as quiet patronage — not loud membership
            marketing. Funds digitization, higher-resolution access, and new rooms.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {patronageTiers.map((tier, i) => (
            <div
              key={tier.id}
              className={cn(
                "flex flex-col border p-6 sm:p-8 archive-fade",
                tier.id === "patron"
                  ? "border-accent/50 bg-ground-elevated"
                  : "border-border bg-ground",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-ink-subtle">
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
              {tier.id === "visitor" ? (
                <Link
                  to="/gallery"
                  className="mt-8 inline-flex h-11 items-center justify-center border border-border font-sans text-[0.72rem] uppercase tracking-[0.16em] hover:border-ink/40"
                >
                  Enter freely
                </Link>
              ) : (
                <>
                  <SignedOut>
                    <Link
                      to="/login"
                      className="mt-8 inline-flex h-11 items-center justify-center bg-ink font-sans text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-deep"
                    >
                      Sign in to support
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <button
                      type="button"
                      className="mt-8 h-11 bg-ink font-sans text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-deep"
                    >
                      Continue as patron
                    </button>
                  </SignedIn>
                </>
              )}
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-ink-subtle">
          Payment processing (Stripe) can be connected at deploy time. This preview
          demonstrates the patronage framing and access model without charging
          cards.
        </p>
      </div>
    </LayoutShell>
  );
}
