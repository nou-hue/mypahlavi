import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { LayoutShell } from "@/components/archive/layout-shell";
import { circleTiers, type CircleTier, type CircleTierId } from "@/data/circle";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  joined: z.string().optional(),
  cancelled: z.string().optional(),
  session_id: z.string().optional(),
  tier: z.string().optional(),
});

export const Route = createFileRoute("/patronage")({
  validateSearch: searchSchema,
  component: CirclePage,
});

type MembershipState = {
  id: string;
  tierId: string;
  tierName: string;
  status: string;
  amountPence: number;
} | null;

function CirclePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [membership, setMembership] = useState<MembershipState>(null);
  const [stripeOn, setStripeOn] = useState<boolean | null>(null);
  const [busyTier, setBusyTier] = useState<CircleTierId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const refreshStatus = useCallback(
    async (sessionId?: string) => {
      try {
        const q = sessionId
          ? `?session_id=${encodeURIComponent(sessionId)}`
          : "";
        const res = await fetch(`/api/circle/status${q}`);
        const data = await res.json();
        setStripeOn(Boolean(data.stripeConfigured));
        setMembership(data.membership ?? null);
        if (data.membership?.status === "active") {
          setStatusNote(
            `Welcome to the Circle · ${data.membership.tierName}`,
          );
        }
      } catch {
        /* ignore */
      }
    },
    [],
  );

  useEffect(() => {
    void refreshStatus(search.session_id);
  }, [refreshStatus, search.session_id]);

  useEffect(() => {
    if (search.cancelled === "1") {
      setStatusNote("Checkout cancelled — no membership was created.");
    }
  }, [search.cancelled]);

  async function startCheckout(tier: CircleTier) {
    setError(null);
    if (isPending) return;

    if (!user) {
      void navigate({
        to: "/login",
        search: {},
      });
      // Store intended tier for return
      try {
        sessionStorage.setItem("circle_tier", tier.id);
      } catch {
        /* ignore */
      }
      return;
    }

    setBusyTier(tier.id);
    try {
      const res = await fetch("/api/circle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.id }),
      });
      const data = await res.json();
      if (res.status === 401) {
        void navigate({ to: "/login", search: {} });
        return;
      }
      if (!res.ok) {
        setError(
          data.message ||
            data.error ||
            "Could not start checkout. Stripe may not be configured.",
        );
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusyTier(null);
    }
  }

  // After login return with stored tier
  useEffect(() => {
    if (!user || isPending) return;
    try {
      const saved = sessionStorage.getItem("circle_tier") as CircleTierId | null;
      if (saved && circleTiers.some((t) => t.id === saved)) {
        sessionStorage.removeItem("circle_tier");
        const tier = circleTiers.find((t) => t.id === saved);
        if (tier) void startCheckout(tier);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPending]);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24 md:py-32">
        <header className="mx-auto max-w-md space-y-8 text-center archive-rise">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.32em] text-ink-subtle">
            The Circle
          </p>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Support the preservation of the archive
          </h1>
          <p className="text-sm leading-[1.75] text-ink-muted">
            Quiet patronage for digitisation, unpublished releases, and the long
            work of an independent collection — closer to a private cultural
            institution than a membership product.
          </p>
        </header>

        {(statusNote || membership?.status === "active") && (
          <div className="mx-auto mt-12 max-w-md border border-border bg-cream px-6 py-8 text-center">
            <p className="font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
              Welcome to the Circle
            </p>
            <p className="mt-3 font-serif text-xl tracking-tight">
              {membership
                ? `${membership.tierName}`
                : statusNote}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Your patronage helps sustain the preservation and expansion of the
              archive.
            </p>
            <Link
              to="/gallery"
              className="mt-6 inline-flex font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
            >
              The Archive →
            </Link>
          </div>
        )}

        {/* The Work — institutional statement */}
        <section className="mx-auto mt-20 max-w-md border-t border-border pt-14 text-center sm:mt-24 sm:pt-16">
          <p className="font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            The Work
          </p>
          <p className="mt-5 font-serif text-xl tracking-tight text-ink sm:text-2xl">
            Digitisation. Conservation. Research.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            The preservation and contextualisation of photographs, documents,
            objects and publications for future generations.
          </p>
        </section>

        {/* Editorial patronage levels — not SaaS cards */}
        <section className="mt-16 border-t border-border sm:mt-20" id="levels">
          <p className="py-8 text-center font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            Levels of patronage
          </p>

          <div className="space-y-0">
            {circleTiers.map((tier) => (
              <article
                key={tier.id}
                className="border-t border-border py-12 sm:py-14"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <h2 className="font-serif text-2xl tracking-tight">
                    {tier.name}
                  </h2>
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted">
                    {tier.priceLabel}
                  </p>
                </div>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                  {tier.description}
                </p>
                <ul className="mt-6 max-w-sm space-y-2">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="text-sm leading-relaxed text-ink-soft"
                    >
                      {perk}
                    </li>
                  ))}
                </ul>
                {tier.forthcoming && tier.forthcoming.length > 0 && (
                  <p className="mt-4 font-sans text-[0.5rem] uppercase tracking-[0.14em] text-ink-subtle">
                    Access features · rolling out
                  </p>
                )}

                <div className="mt-8">
                  {membership?.status === "active" &&
                  membership.tierId === tier.id ? (
                    <p className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-subtle">
                      Your current level
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={busyTier === tier.id || stripeOn === false}
                      onClick={() => void startCheckout(tier)}
                      className={cn(
                        "font-sans text-[0.6rem] uppercase tracking-[0.18em] transition-colors",
                        busyTier === tier.id
                          ? "text-ink-subtle"
                          : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {busyTier === tier.id
                        ? "Connecting to Stripe…"
                        : !user
                          ? "Sign in to join →"
                          : stripeOn === false
                            ? "Stripe not configured"
                            : `Join ${tier.name} →`}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {error && (
          <p className="mt-10 text-center text-sm text-accent" role="alert">
            {error}
          </p>
        )}

        {stripeOn === false && (
          <p className="mt-10 text-center text-sm text-ink-muted">
            Stripe is not configured on this environment. Set{" "}
            <span className="font-sans text-xs">STRIPE_SECRET_KEY</span> to
            enable live patronage.
          </p>
        )}

        <section className="mt-20 border-t border-border pt-12 sm:mt-24">
          <p className="max-w-md text-sm leading-relaxed text-ink-muted">
            The Circle sustains the working collection — digitisation, Vault
            releases, and the long work of an independent archive. Related:{" "}
            <Link to="/vault" className="text-ink-soft underline-offset-4 hover:underline">
              The Vault
            </Link>
            .
          </p>
        </section>
      </div>
    </LayoutShell>
  );
}
