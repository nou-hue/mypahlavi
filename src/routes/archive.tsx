import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";

export const Route = createFileRoute("/archive")({ component: ArchivePage });

const worlds = [
  { label: "People", kicker: "House · Court · Public life", href: "/lineage", image: "/archive/other-family/user-imperial-trio-reza-farah-shah.jpg", text: "Lives that shaped, witnessed and carried an era — royal, public and private." },
  { label: "Places", kicker: "Tehran · Persepolis · Caspian · World", href: "/gallery", image: "/archive/farah-pahlavi/user-farah-persepolis-gold-dress.jpg", text: "Cities, palaces, landscapes and international settings as historical evidence." },
  { label: "Culture", kicker: "Art · Fashion · Cinema · Design", href: "/library", image: "/archive/farah-pahlavi/user-farah-red-velvet-atelier.jpg", text: "The visual language of modern Iranian life: dress, image-making, taste and cultural production." },
  { label: "Modernity", kicker: "Architecture · Education · Industry · Diplomacy", href: "/gallery", image: "/archive/other-family/user-before-the-map-of-iran.jpg", text: "A country in transformation, traced through institutions, infrastructure and public ambition." },
  { label: "Memory", kicker: "Exile · Diaspora · Continuity", href: "/vault", image: "/archive/reza-pahlavi/user-young-reza-on-throne.jpg", text: "What survives after rupture: photographs, testimony, family records and inherited memory." },
] as const;

function ArchivePage() {
  return <LayoutShell>
    <main className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
      <header className="mx-auto max-w-2xl text-center archive-rise">
        <p className="font-sans text-[0.58rem] uppercase tracking-[0.34em] text-ink-subtle">The Archive</p>
        <h1 className="mt-7 font-serif text-4xl tracking-tight sm:text-6xl">Iranian modern life, in context.</h1>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-[1.8] text-ink-muted">Explore the record through people, places, culture, modernity and memory. Each room connects photographs, writing and objects across the collection.</p>
      </header>
      <div className="mt-24 border-t border-border sm:mt-32">
        {worlds.map((world, i) => <Link key={world.label} to={world.href} className="group grid gap-10 border-b border-border py-16 md:grid-cols-12 md:items-center md:gap-14 md:py-24">
          <div className={`md:col-span-5 ${i % 2 ? "md:order-2" : ""}`}><div className="mx-auto max-w-sm overflow-hidden border border-border/50 bg-deep shadow-soft"><img src={world.image} alt="" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.015] group-hover:opacity-90" /></div></div>
          <div className={`md:col-span-7 ${i % 2 ? "md:order-1 md:pr-16" : "md:pl-16"}`}><p className="font-sans text-[0.56rem] uppercase tracking-[0.26em] text-ink-subtle">{world.kicker}</p><h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">{world.label}</h2><p className="mt-5 max-w-md text-sm leading-[1.8] text-ink-muted">{world.text}</p><p className="mt-8 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink-subtle">Enter {world.label} →</p></div>
        </Link>)}
      </div>
      <section className="mx-auto max-w-3xl py-24 text-center sm:py-32"><p className="font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ink-subtle">Research paths</p><h2 className="mt-6 font-serif text-3xl tracking-tight">Follow the record, not the menu.</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-[1.8] text-ink-muted">Dates, people, locations and themes will increasingly connect records across the archive as cataloguing continues.</p></section>
    </main>
  </LayoutShell>;
}
