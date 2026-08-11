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

function LineagePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(search.person ?? null);

  useEffect(() => {
    if (search.person) setSelectedId(search.person);
  }, [search.person]);

  const selected = useMemo(
    () => familyMembers.find((m) => m.id === selectedId) ?? null,
    [selectedId],
  );

  const generations = useMemo(() => {
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

  return (
    <LayoutShell>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-14 max-w-2xl space-y-5 archive-rise">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            The Century
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Dynastic timeline
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            A documentary chronology of the Pahlavi era — dates, figures, and
            context without promotional gloss. Select a person for biography and
            linked plates.
          </p>
        </header>

        {/* The Century — timeline spine */}
        <div className="mb-20 overflow-x-auto border-y border-border bg-ground-elevated/40 py-8 archive-rise">
          <div className="flex min-w-max items-center gap-0 px-1">
            {[
              { y: "1925", l: "Dynasty" },
              { y: "1930s", l: "Reza Shah" },
              { y: "1941", l: "Succession" },
              { y: "1960s", l: "Modernity" },
              { y: "1979", l: "Revolution" },
              { y: "Exile", l: "Memory" },
              { y: "Present", l: "Continuity" },
            ].map((n, i, arr) => (
              <div key={n.y} className="flex items-center">
                <div className="px-4 text-center sm:px-6">
                  <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                    {n.y}
                  </p>
                  <p className="mt-1 font-serif text-sm tracking-tight sm:text-base">
                    {n.l}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-px w-6 bg-border sm:w-10" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-16">
          {generations.map(([gen, members]) => (
            <section key={gen}>
              <p className="mb-5 font-sans text-[0.68rem] uppercase tracking-[0.2em] text-ink-subtle sm:mb-6">
                Generation {gen}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectPerson(m.id)}
                    className={cn(
                      "group border border-border bg-ground p-3 text-left transition-colors sm:p-4",
                      selectedId === m.id
                        ? "border-accent/50"
                        : "hover:border-ink/25",
                    )}
                  >
                    <ArchiveImage
                      src={m.portraitSrc}
                      alt={m.name}
                      gradient={m.portraitGradient}
                      className="mb-3 aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.01] sm:mb-4"
                    />
                    <p className="font-serif text-lg leading-snug sm:text-xl">{m.name}</p>
                    <p className="mt-1 text-xs text-ink-muted sm:text-sm">{m.title}</p>
                    <p className="mt-1.5 font-sans text-[0.62rem] uppercase tracking-[0.12em] text-ink-subtle sm:mt-2 sm:text-[0.68rem]">
                      {m.years}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
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
  const children = familyMembers.filter((m) => m.parentIds.includes(member.id));

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-deep/40 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dossier"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-border bg-ground text-ink shadow-soft archive-fade">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-ink-subtle">
            Dossier
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8">
          <ArchiveImage
            src={member.portraitSrc}
            alt={member.name}
            gradient={member.portraitGradient}
            className="mb-6 aspect-[4/5] max-h-80 w-full"
          />
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.16em] text-accent">
            {member.years}
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight">{member.name}</h2>
          <p className="mt-1 text-ink-muted">{member.title}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {member.tags.map((t) => (
              <span
                key={t}
                className="border border-border px-2.5 py-1 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-ink-subtle"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">{member.summary}</p>

          {parents.length > 0 && (
            <div className="mt-8">
              <p className="mb-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-subtle">
                Parents
              </p>
              <div className="flex flex-wrap gap-2">
                {parents.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelect(p.id)}
                    className="border border-border px-3 py-1.5 text-xs hover:border-accent/40"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-subtle">
                Children
              </p>
              <div className="flex flex-wrap gap-2">
                {children.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="border border-border px-3 py-1.5 text-xs hover:border-accent/40"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {linked.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-subtle">
                Linked images · {linked.length}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {linked.slice(0, 12).map((img) => (
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
                    <p className="mt-2 font-serif text-sm leading-snug group-hover:text-accent">
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
