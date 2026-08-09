import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <LayoutShell>
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
          Account
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Sign in to manage patronage and save preferences. The public archive
          remains open without an account.
        </p>

        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/patronage" })}
                className="flex h-12 w-full items-center justify-center border border-border font-sans text-[0.72rem] uppercase tracking-[0.16em] transition-colors hover:border-ink hover:bg-ink hover:text-cream"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Sign-in is disabled.</p>
          )}
        </div>

        <Link
          to="/"
          className="mt-8 text-center font-sans text-[0.72rem] uppercase tracking-[0.16em] text-ink-subtle hover:text-ink"
        >
          Return to archive
        </Link>
      </main>
    </LayoutShell>
  );
}
