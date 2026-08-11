import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { vaultRooms, type VaultRoom } from "@/data/vault-rooms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vault")({
  component: VaultPage,
});

function VaultPage() {
  // One small partial clue near the opening — not a hero
  const openingClue = vaultRooms[0]?.fragments[0];

  return (
    <LayoutShell>
      <div className="mx-auto max-w-2xl px-6 py-20 sm:px-10 sm:py-28 md:py-36">
        {/* Opening — almost empty */}
        <header className="mx-auto max-w-md space-y-8 text-center archive-rise sm:space-y-10">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.32em] text-ink-subtle">
            The Vault
          </p>
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Rare and unpublished
          </h1>
          <p className="text-sm leading-[1.75] text-ink-muted">
            A quieter room of the archive — contact sheets, correspondence, film
            stills, and material culture held for careful release.
          </p>
        </header>

        {/* Single partial archival clue */}
        {openingClue?.src && (
          <div className="mx-auto mt-16 flex justify-center sm:mt-20">
            <div className="w-[7.5rem] overflow-hidden border border-border/40 bg-cream sm:w-[8.5rem]">
              <img
                src={openingClue.src}
                alt=""
                className="aspect-[3/4] w-full scale-125 object-cover opacity-90"
                style={{ objectPosition: openingClue.position ?? "center" }}
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        )}

        <p className="mt-16 text-center font-sans text-[0.7rem] text-ink-subtle sm:mt-20">
          ↓
        </p>

        {/* Four doors — editorial sequence, not identical cards */}
        <div className="mt-16 space-y-0 border-t border-border sm:mt-20">
          {vaultRooms.map((room, i) => (
            <VaultDoor key={room.id} room={room} index={i} />
          ))}
        </div>

        {/* Circle — quiet, substantial space */}
        <section className="mt-28 border-t border-border pt-16 sm:mt-36 sm:pt-20">
          <p className="font-sans text-[0.52rem] uppercase tracking-[0.24em] text-ink-subtle">
            The Circle
          </p>
          <p className="mt-5 max-w-sm font-serif text-xl tracking-tight text-ink sm:text-2xl">
            The working collection is sustained through patronage and careful
            release.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            The Circle sustains digitisation and early Vault releases as rooms
            open.
          </p>
          <Link
            to="/patronage"
            className="mt-8 inline-flex font-sans text-[0.6rem] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
          >
            The Circle →
          </Link>
        </section>
      </div>
    </LayoutShell>
  );
}

function VaultDoor({ room, index }: { room: VaultRoom; index: number }) {
  const frag = room.fragments.find((f) => f.src) ?? room.fragments[0];
  const alignRight = index % 2 === 1;

  return (
    <Link
      to="/vault/$room"
      params={{ room: room.slug }}
      className={cn(
        "group block border-b border-border py-14 transition-opacity hover:opacity-90 sm:py-16",
        alignRight && "sm:text-right",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-8",
          alignRight
            ? "sm:flex-row-reverse sm:items-start sm:justify-between"
            : "sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className={cn("max-w-xs", alignRight && "sm:ml-auto")}>
          <p className="font-sans text-[0.52rem] uppercase tracking-[0.22em] text-ink-subtle">
            {room.meta}
          </p>
          <h2 className="mt-3 font-serif text-xl tracking-tight sm:text-2xl">
            {room.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {room.desc}
          </p>
          <p className="mt-5 font-sans text-[0.5rem] uppercase tracking-[0.18em] text-ink-subtle">
            By invitation
          </p>
        </div>

        {/* Small fragment or empty plate */}
        <div
          className={cn(
            "shrink-0",
            alignRight ? "sm:mr-auto sm:ml-0" : "sm:ml-8",
          )}
        >
          {frag?.src ? (
            <div
              className={cn(
                "overflow-hidden border border-border/40 bg-cream",
                frag.aspect === "strip"
                  ? "w-28 sm:w-32"
                  : frag.aspect === "sheet"
                    ? "w-24 sm:w-28"
                    : "w-20 sm:w-24",
              )}
            >
              <img
                src={frag.src}
                alt=""
                className={cn(
                  "w-full object-cover opacity-90",
                  frag.aspect === "strip"
                    ? "aspect-[3/1] scale-y-110"
                    : "aspect-[4/5] scale-125",
                )}
                style={{ objectPosition: frag.position ?? "center" }}
                loading="lazy"
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex h-24 w-20 items-center justify-center border border-border/40 bg-ground-elevated sm:h-28 sm:w-24">
              <span className="px-2 text-center font-sans text-[0.45rem] uppercase tracking-[0.14em] text-ink-subtle">
                Held
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
