import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/timeline")({ component: TimelinePage });
const moments = [
  ["1925", "A new dynasty", "The beginning of the Pahlavi period and a new programme of state-building."],
  ["1941", "A changed reign", "Mohammad Reza Pahlavi succeeds his father during a period of war and foreign occupation."],
  ["1950s", "Reconstruction and acceleration", "Political upheaval sits beside expanding infrastructure, institutions and international ties."],
  ["1963", "The White Revolution", "Land reform, literacy, suffrage and social programmes reshape the public landscape."],
  ["1967", "Coronation", "Farah Pahlavi is crowned Shahbanu, an image that becomes central to the visual record of the era."],
  ["1971", "Persepolis", "The 2,500-year celebration places ancient continuity and modern state spectacle in the same frame."],
  ["1979", "Revolution and rupture", "The monarchy ends; the archive enters a new life across exile, diaspora and private collections."],
  ["After 1979", "Memory in motion", "Photographs, objects and testimony continue to move between families, institutions and generations."],
] as const;
function TimelinePage(){return <LayoutShell><main className="mx-auto max-w-5xl px-6 py-20 sm:px-12 sm:py-28"><header className="max-w-2xl"><p className="font-sans text-[0.58rem] uppercase tracking-[0.34em] text-ink-subtle">Chronology</p><h1 className="mt-7 font-serif text-5xl tracking-tight sm:text-6xl">A century in sequence.</h1><p className="mt-7 max-w-xl text-sm leading-[1.8] text-ink-muted">A navigational chronology for the archive — political milestones alongside culture, institutions, public life and memory.</p></header><div className="mt-20 border-t border-border sm:mt-28">{moments.map(([year,title,text])=><article key={year} className="grid gap-5 border-b border-border py-10 sm:grid-cols-[10rem_1fr] sm:gap-12 sm:py-14"><p className="font-serif text-3xl tracking-tight text-ink-soft">{year}</p><div><h2 className="font-serif text-2xl tracking-tight">{title}</h2><p className="mt-4 max-w-xl text-sm leading-[1.8] text-ink-muted">{text}</p></div></article>)}</div><div className="py-20 text-center"><Link to="/archive" className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ink-muted hover:text-ink">Explore the archive →</Link></div></main></LayoutShell>}
