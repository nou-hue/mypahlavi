import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import { ArchiveImage } from "@/components/archive/archive-image";
import { galleryImages, familyMembers, libraryItems } from "@/data/archive";
import { formatGBP, shopProducts, startingPrice } from "@/data/shop";
import siteCopy from "@/data/site-copy.json";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const heroSrc = siteCopy.heroSrc;
  const featured = galleryImages
    .filter(
      (g) =>
        g.src &&
        (g.personIds.includes("mohammad-reza") ||
          g.personIds.includes("farah") ||
          g.room === "coronation" ||
          g.room === "family"),
    )
    .slice(0, 8);
  const people = familyMembers.filter((m) =>
    ["reza-shah", "mohammad-reza", "farah", "reza"].includes(m.id),
  );
  const shopFeatured = shopProducts.filter((p) => p.featured).slice(0, 3);
  const essays = libraryItems.slice(0, 3);

  return (
    <LayoutShell ghostHeader>
      <section className="relative min-h-[100svh] overflow-hidden bg-deep text-cream">
        {heroSrc ? (
          <img
            src={heroSrc}
            alt={siteCopy.heroCaption}
            className="absolute inset-0 h-full w-full object-cover object-[center_20%] opacity-75"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/30" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-20">
          <div className="archive-rise max-w-3xl space-y-6">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.28em] text-cream/55">
              {siteCopy.heroKicker} · {galleryImages.length} plates
            </p>
            <h1 className="font-serif text-[clamp(3rem,10vw,6.5rem)] leading-[0.92] tracking-[-0.03em]">
              {siteCopy.heroTitle}
            </h1>
            <p className="max-w-xl font-serif text-xl leading-relaxed text-cream/78 sm:text-2xl">
              {siteCopy.heroSub}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-cream/50">
              {siteCopy.heroCaption}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/gallery"
                className="inline-flex h-12 items-center gap-2 border border-cream/30 bg-cream/5 px-6 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-cream hover:text-deep"
              >
                Enter the archive
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/library"
                className="inline-flex h-12 items-center px-2 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-cream/60 transition-colors hover:text-cream"
              >
                Reading room
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-6 border-t border-cream/15 pt-6 sm:grid-cols-3">
            <Meta label="Gallery" value={`${galleryImages.length} framed plates`} />
            <Meta label="Library" value="Essays · letters · books" />
            <Meta label="Lineage" value="An interactive house" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
            Manifesto
          </p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-5xl text-balance">
            History deserves rooms, not noise
          </h2>
          <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
            mypahlavi.com is an independent archive of the Pahlavi family — the last
            imperial house of Iran. We gather photographs, essays, and lineage with
            museum calm: ivory ground, measured type, and images held in dark brown
            frames as if they still hung in a private wing after hours.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-ground-elevated">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl space-y-3">
              <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
                From the gallery
              </p>
              <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
                Faces the century kept
              </h2>
              <p className="text-base leading-relaxed text-ink-muted">
                Coronation light, state visits, family silence — plates chosen for
                presence, not volume. Each carries a written wall label.
              </p>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-accent"
            >
              Open gallery <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((img, i) => (
              <Link
                key={img.id}
                to="/gallery"
                search={{ room: img.room, id: img.id }}
                className="group archive-fade"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ArchiveImage
                  src={img.src}
                  alt={img.title}
                  gradient={img.gradient}
                  className="aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.01]"
                />
                <div className="mt-3 space-y-1 px-0.5">
                  <p className="font-serif text-lg leading-snug">{img.title}</p>
                  <p className="text-sm text-ink-muted line-clamp-2">
                    {img.cardCaption || img.caption}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
              Reading room
            </p>
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Words with weight
            </h2>
            <p className="text-base leading-relaxed text-ink-muted">
              Essays and letters written for slow attention — on image, exile,
              ceremony, and how a dynasty becomes an archive.
            </p>
          </div>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-accent"
          >
            All writing <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {essays.map((e) => (
            <Link
              key={e.id}
              to="/library"
              className="group flex flex-col border border-border bg-ground p-6 transition-colors hover:border-accent/40"
            >
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
                {e.kind} · {e.year}
              </p>
              <h3 className="mt-3 font-serif text-2xl leading-snug group-hover:text-accent">
                {e.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                {e.excerpt}
              </p>
              <p className="mt-6 font-sans text-[0.68rem] uppercase tracking-[0.14em] text-accent">
                Read
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-deep text-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl space-y-3">
              <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-cream/45">
                Editions
              </p>
              <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
                Objects from the archive
              </h2>
              <p className="text-base leading-relaxed text-cream/65">
                Quiet merch — prints and apparel fulfilled on demand through Printify.
                Designed to feel commissioned, not sold loudly.
              </p>
            </div>
            <Link
              to="/editions"
              className="inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-accent-soft"
            >
              Browse shop <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {shopFeatured.map((p) => (
              <Link
                key={p.id}
                to="/editions/$productId"
                params={{ productId: p.slug }}
                className="group border border-cream/15 bg-cream/[0.03]"
              >
                <div
                  className={cn(
                    "aspect-[4/5] bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.01]",
                    p.gradient,
                  )}
                />
                <div className="p-4">
                  <p className="font-serif text-xl leading-snug">{p.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-cream/45">
                    from {formatGBP(startingPrice(p))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ground-elevated">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="space-y-5">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
              Lineage
            </p>
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
              A family as a journey
            </h2>
            <p className="max-w-md text-base leading-relaxed text-ink-muted">
              From Reza Shah to the children of Farah — sparse nodes, soft dossiers,
              and portraits that lead before the biography speaks.
            </p>
            <Link
              to="/lineage"
              className="inline-flex h-11 items-center gap-2 border border-ink/15 px-5 font-sans text-[0.72rem] uppercase tracking-[0.16em] transition-colors hover:border-ink/40"
            >
              Explore family tree
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {people.map((p) => (
              <Link
                key={p.id}
                to="/lineage"
                search={{ person: p.id }}
                className="group"
              >
                <ArchiveImage
                  src={p.portraitSrc}
                  alt={p.name}
                  gradient={p.portraitGradient}
                  className="aspect-square"
                />
                <p className="mt-3 font-serif text-lg leading-snug">{p.name}</p>
                <p className="text-xs text-ink-subtle">{p.years}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-3">
          <Feature
            kicker="Patronage"
            title="Keep the lights on"
            body="Subscriptions as quiet patronage — higher-resolution rooms, early exhibitions, and support for digitization."
            to="/patronage"
            cta="See tiers"
          />
          <Feature
            kicker="Gallery"
            title={`${galleryImages.length} framed plates`}
            body="Dark brown frames, pale mats, written captions. An exhibition you can walk with the arrow keys."
            to="/gallery"
            cta="Enter gallery"
          />
          <Feature
            kicker="Shop"
            title="Editions for the wall"
            body="Archival prints and soft goods, Printify-ready — objects that feel like they left a museum store quietly."
            to="/editions"
            cta="Open shop"
          />
        </div>
      </section>
    </LayoutShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-cream/40">
        {label}
      </p>
      <p className="mt-1 font-serif text-lg text-cream/85">{value}</p>
    </div>
  );
}

function Feature({
  kicker,
  title,
  body,
  to,
  cta,
}: {
  kicker: string;
  title: string;
  body: string;
  to: "/library" | "/editions" | "/patronage" | "/gallery";
  cta: string;
}) {
  return (
    <div className="flex flex-col border-t border-border pt-8">
      <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
        {kicker}
      </p>
      <h3 className="mt-3 font-serif text-3xl tracking-tight">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{body}</p>
      <Link
        to={to}
        className="mt-6 inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-accent"
      >
        {cta} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
