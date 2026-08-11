import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { LayoutShell } from "@/components/archive/layout-shell";
import { ArchiveImage } from "@/components/archive/archive-image";
import {
  familyMembers,
  imagesForMember,
  type FamilyMember,
} from "@/data/archive";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  person: z.string().optional(),
});

export const Route = createFileRoute("/lineage")({
  validateSearch: searchSchema,
  component: LineagePage,
});

const GENERATION_META: Record<
  number,
  { label: string; subtitle: string }
> = {
  1: { label: "Generation 1", subtitle: "The Founding" },
  2: { label: "Generation 2", subtitle: "The Imperial Court" },
  3: { label: "Generation 3", subtitle: "The Children" },
  4: { label: "Generation 4", subtitle: "The Living Generation" },
};

const TIMELINE = [
  { y: "1925", l: "Dynasty" },
  { y: "1930s", l: "Reza Shah" },
  { y: "1941", l: "Succession" },
  { y: "1960s", l: "Modernity" },
  { y: "1979", l: "Revolution" },
  { y: "Exile", l: "Memory" },
  { y: "Present", l: "Continuity" },
] as const;

function LineagePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(
    search.person ?? null,
  );

  useEffect(() => {
    if (search.person) setSelectedId(search.person);
  }, [search.person]);

  const selected = useMemo(
    () => familyMembers.find((m) => m.id === selectedId) ?? null,
    [selectedId],
  );

  const byGen = useMemo(() => {
    const map = new Map<number, FamilyMember[]>();
    for (const m of familyMembers) {
      const list = map.get(m.generation) ?? [];
      list.push(m);
      map.set(m.generation, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  function selectPerson(id: string) {
    setSelectedId(id);
    void navigate({ search: { person: id } });
  }

  function closeDossier() {
    setSelectedId(null);
    void navigate({ search: {} });
  }

  // Gen 3 ordering: Shahnaz, Reza, Farahnaz, Ali-Reza, Leila, then Yasmine (spouse)
  const gen3Order = [
    "shahnaz",
    "reza",
    "farahnaz",
    "ali-reza",
    "leila",
    "yasmine",
  ];
  // Gen 4: Reza/Yasmine branch first, then Ali Reza branch
  const gen4Main = ["noor", "iman", "farah-d"];

  function ordered(gen: number, members: FamilyMember[]) {
    if (gen === 3) {
      return [...members].sort(
        (a, b) => gen3Order.indexOf(a.id) - gen3Order.indexOf(b.id),
      );
    }
    if (gen === 4) {
      return members.filter((m) => gen4Main.includes(m.id));
    }
    if (gen === 1) {
      // Reza Shah then Tadj
      return [...members].sort((a, b) =>
        a.id === "reza-shah" ? -1 : b.id === "reza-shah" ? 1 : 0,
      );
    }
    if (gen === 2) {
      return [...members].sort((a, b) =>
        a.id === "mohammad-reza" ? -1 : b.id === "mohammad-reza" ? 1 : 0,
      );
    }
    return members;
  }

  const iryana = familyMembers.find((m) => m.id === "iryana-leila");

  return (
    <LayoutShell>
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-14 max-w-xl space-y-5 archive-rise">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink-subtle">
            The Century
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Dynastic timeline
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            A documentary chronology of the House — person, generation, era,
            context. Select a name for the archive record.
          </p>
        </header>

        {/* Editorial timeline spine */}
        <div className="mb-20 overflow-x-auto border-y border-border py-7 archive-rise">
          <div className="flex min-w-max items-center gap-0 px-1">
            {TIMELINE.map((n, i, arr) => (
              <div key={n.y} className="flex items-center">
                <div className="px-3 text-center sm:px-5">
                  <p className="font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
                    {n.y}
                  </p>
                  <p className="mt-1 font-serif text-sm tracking-tight text-ink-soft">
                    {n.l}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-px w-5 bg-border sm:w-8" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mb-16 font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink-subtle">
          The House
        </p>

        <div className="space-y-24 sm:space-y-32">
          {byGen.map(([gen, members]) => {
            const meta = GENERATION_META[gen] ?? {
              label: `Generation ${gen}`,
              subtitle: "",
            };
            const list = ordered(gen, members);

            // Gen 3: children of court vs Yasmine (spouse) visually separated
            const gen3Children = list.filter((m) => m.id !== "yasmine");
            const yasmine = list.find((m) => m.id === "yasmine");

            return (
              <section key={gen} className="archive-rise">
                <div className="mb-10 border-b border-border pb-4">
                  <p className="font-sans text-[0.55rem] uppercase tracking-[0.24em] text-ink-subtle">
                    {meta.label}
                  </p>
                  {meta.subtitle && (
                    <p className="mt-1 font-serif text-xl tracking-tight text-ink sm:text-2xl">
                      {meta.subtitle}
                    </p>
                  )}
                </div>

                {gen === 2 ? (
                  /* Imperial couple — visually connected */
                  <div className="mx-auto flex max-w-lg flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-14">
                    {list.map((m) => (
                      <PersonPlate
                        key={m.id}
                        member={m}
                        selected={selectedId === m.id}
                        onSelect={() => selectPerson(m.id)}
                        size="medium"
                      />
                    ))}
                  </div>
                ) : gen === 3 ? (
                  <div className="space-y-14">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 sm:gap-x-10">
                      {gen3Children.map((m) => (
                        <PersonPlate
                          key={m.id}
                          member={m}
                          selected={selectedId === m.id}
                          onSelect={() => selectPerson(m.id)}
                          size="small"
                        />
                      ))}
                    </div>
                    {yasmine && (
                      <div className="border-t border-border/60 pt-12">
                        <p className="mb-8 text-center font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
                          Linked by marriage · Generation 3
                        </p>
                        <div className="flex justify-center">
                          <PersonPlate
                            member={yasmine}
                            selected={selectedId === yasmine.id}
                            onSelect={() => selectPerson(yasmine.id)}
                            size="small"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : gen === 4 ? (
                  <div className="space-y-16">
                    <div>
                      <p className="mb-8 text-center font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
                        Children of Reza & Yasmine Pahlavi
                      </p>
                      <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
                        {list.map((m) => (
                          <PersonPlate
                            key={m.id}
                            member={m}
                            selected={selectedId === m.id}
                            onSelect={() => selectPerson(m.id)}
                            size="small"
                            contemporary
                          />
                        ))}
                      </div>
                    </div>

                    {iryana && (
                      <div className="border-t border-border/60 pt-14">
                        <p className="mb-3 text-center font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ink-subtle">
                          Ali Reza branch
                        </p>
                        <p className="mb-8 text-center text-xs text-ink-muted">
                          Daughter of Prince Ali Reza Pahlavi — not of the
                          Reza–Yasmine line
                        </p>
                        <div className="flex justify-center">
                          <PersonPlate
                            member={iryana}
                            selected={selectedId === iryana.id}
                            onSelect={() => selectPerson(iryana.id)}
                            size="small"
                            contemporary
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Gen 1 — equal founding pair */
                  <div className="mx-auto flex max-w-lg flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-14">
                    {list.map((m) => (
                      <PersonPlate
                        key={m.id}
                        member={m}
                        selected={selectedId === m.id}
                        onSelect={() => selectPerson(m.id)}
                        size="medium"
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Continuity */}
        <section className="mt-28 border-t border-border pt-16 sm:mt-36 sm:pt-20">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.28em] text-ink-subtle">
            Continuity
          </p>
          <p className="mt-4 max-w-md font-serif text-2xl tracking-tight text-ink sm:text-3xl">
            The archive does not end in 1979.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-muted">
            Exile · Memory · Family · Present
          </p>
        </section>
      </div>

      {selected && (
        <Dossier
          member={selected}
          onClose={closeDossier}
          onSelect={selectPerson}
        />
      )}
    </LayoutShell>
  );
}

function PersonPlate({
  member,
  selected,
  onSelect,
  size = "small",
  contemporary = false,
}: {
  member: FamilyMember;
  selected: boolean;
  onSelect: () => void;
  size?: "small" | "medium";
  contemporary?: boolean;
}) {
  const plate =
    size === "medium"
      ? "w-[9.5rem] sm:w-[11rem]"
      : "w-[7.5rem] sm:w-[8.5rem]";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex flex-col items-center text-center transition-opacity",
        selected ? "opacity-100" : "opacity-90 hover:opacity-100",
      )}
    >
      <div
        className={cn(
          "overflow-hidden border bg-cream",
          plate,
          selected ? "border-ink/30" : "border-border/60",
          contemporary && "opacity-95",
        )}
      >
        {member.portraitSrc ? (
          <ArchiveImage
            src={member.portraitSrc}
            alt={member.name}
            gradient={member.portraitGradient}
            className="aspect-[4/5] w-full"
          />
        ) : (
          <div
            className={cn(
              "flex aspect-[4/5] w-full flex-col items-center justify-center bg-ground-elevated px-3",
            )}
          >
            <p className="font-sans text-[0.5rem] uppercase tracking-[0.18em] text-ink-subtle">
              Portrait
            </p>
            <p className="mt-2 font-serif text-xs leading-snug text-ink-muted">
              Awaiting archival plate
            </p>
          </div>
        )}
      </div>
      <p className="mt-3 max-w-[9rem] font-serif text-sm leading-snug tracking-tight sm:text-[0.95rem]">
        {member.name}
      </p>
      <p className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.12em] text-ink-subtle">
        {member.years}
      </p>
    </button>
  );
}

function Dossier({
  member,
  onClose,
  onSelect,
}: {
  member: FamilyMember;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const linked = imagesForMember(member.id);
  const parents = member.parentIds
    .map((id) => familyMembers.find((m) => m.id === id))
    .filter(Boolean) as FamilyMember[];
  const children = familyMembers.filter((m) =>
    m.parentIds.includes(member.id),
  );

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-deep/30 backdrop-blur-[1px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dossier"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-ground text-ink archive-fade">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
            Archive record
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={1.25} />
          </button>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-[11rem] overflow-hidden border border-border/60 bg-cream">
            {member.portraitSrc ? (
              <ArchiveImage
                src={member.portraitSrc}
                alt={member.name}
                gradient={member.portraitGradient}
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-ground-elevated px-4 text-center">
                <p className="font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle">
                  Archival plate forthcoming
                </p>
              </div>
            )}
          </div>

          <p className="mt-8 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-subtle">
            {member.years}
          </p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">
            {member.name}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{member.title}</p>

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">
            {member.summary}
          </p>

          {parents.length > 0 && (
            <div className="mt-10">
              <p className="mb-3 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle">
                Parents
              </p>
              <div className="flex flex-wrap gap-2">
                {parents.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelect(p.id)}
                    className="border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle">
                Children
              </p>
              <div className="flex flex-wrap gap-2">
                {children.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="border border-border px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {linked.length > 0 && (
            <div className="mt-10">
              <p className="mb-4 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-ink-subtle">
                Linked plates · {linked.length}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {linked.slice(0, 8).map((img) => (
                  <Link
                    key={img.id}
                    to="/gallery"
                    search={{ id: img.id, room: img.room }}
                    className="group"
                  >
                    <ArchiveImage
                      src={img.src}
                      alt={img.title}
                      gradient={img.gradient}
                      className="aspect-[4/3]"
                    />
                    <p className="mt-2 font-serif text-xs leading-snug text-ink-muted group-hover:text-ink">
                      {img.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
