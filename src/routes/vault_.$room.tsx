import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import { getVaultRoom, vaultRooms } from "@/data/vault-rooms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vault_/$room")({
  component: VaultRoomPage,
});

function VaultRoomPage() {
  const { room: roomSlug } = Route.useParams();
  const room = getVaultRoom(roomSlug);

  if (!room) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl">Not found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            This Vault room is not open.
          </p>
          <Link
            to="/vault"
            className="mt-8 inline-flex font-sans text-[0.6rem] uppercase tracking-[0.16em] text-ink-muted hover:text-ink"
          >
            ← Back to Vault
          </Link>
        </div>
      </LayoutShell>
    );
  }

  const others = vaultRooms.filter((r) => r.id !== room.id);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-2xl px-6 py-14 sm:px-10 sm:py-20">
        <Link
          to="/vault"
          className="mb-14 inline-flex items-center gap-2 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.25} /> Back to Vault
        </Link>

        <header className="max-w-md space-y-5 archive-rise">
          <p className="font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            The Vault · {room.meta}
          </p>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {room.title}
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">{room.desc}</p>
        </header>

        {/* Fragments — partial, small, scarce */}
        <div className="mt-16 flex flex-wrap items-start gap-6 sm:mt-20 sm:gap-8">
          {room.fragments.map((frag, i) =>
            frag.src ? (
              <div
                key={i}
                className={cn(
                  "overflow-hidden border border-border/40 bg-cream",
                  frag.aspect === "strip"
                    ? "w-full max-w-[16rem]"
                    : frag.aspect === "sheet"
                      ? "w-[8rem] sm:w-[9rem]"
                      : "w-[7rem] sm:w-[8rem]",
                  i === 1 && "mt-8 sm:mt-12",
                  i === 2 && "mt-4 sm:ml-6",
                )}
              >
                <img
                  src={frag.src}
                  alt={frag.alt}
                  className={cn(
                    "w-full object-cover",
                    frag.aspect === "strip"
                      ? "aspect-[5/2] scale-y-105"
                      : "aspect-[4/5] scale-125",
                  )}
                  style={{ objectPosition: frag.position ?? "center" }}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ) : (
              <div
                key={i}
                className={cn(
                  "flex h-32 w-24 flex-col items-center justify-center border border-border/40 bg-ground-elevated sm:h-36 sm:w-28",
                  i === 1 && "mt-6",
                )}
              >
                <p className="font-sans text-[0.45rem] uppercase tracking-[0.16em] text-ink-subtle">
                  Held
                </p>
                <p className="mt-2 px-3 text-center font-sans text-[0.45rem] uppercase tracking-[0.1em] text-ink-subtle/70">
                  Not yet released
                </p>
              </div>
            ),
          )}
        </div>

        <section className="mt-16 max-w-md border-t border-border pt-10">
          <p className="font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
            Archival note
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {room.note}
          </p>
          <p className="mt-6 font-sans text-[0.5rem] uppercase tracking-[0.18em] text-ink-subtle">
            By invitation · Careful release
          </p>
        </section>

        {others.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <p className="mb-6 font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
              Other rooms
            </p>
            <ul className="space-y-0 border-t border-border">
              {others.map((r) => (
                <li key={r.id} className="border-b border-border">
                  <Link
                    to="/vault/$room"
                    params={{ room: r.slug }}
                    className="flex items-baseline justify-between gap-4 py-4 opacity-80 transition-opacity hover:opacity-100"
                  >
                    <span className="font-serif text-lg tracking-tight">
                      {r.title}
                    </span>
                    <span className="shrink-0 font-sans text-[0.5rem] uppercase tracking-[0.14em] text-ink-subtle">
                      {r.meta}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 border-t border-border pt-8">
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.25} /> Back to Vault
          </Link>
        </div>
      </div>
    </LayoutShell>
  );
}
