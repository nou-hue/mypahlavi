import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ground">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-14 px-8 py-16 sm:px-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-4">
          <p className="font-serif text-xl tracking-[0.16em] sm:text-2xl">MYPAHLAVI</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            A research-led archive and independent journal documenting
            twentieth-century Iran through photographs, objects, testimony,
            architecture and primary sources.
          </p>
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-subtle">
            Research · Preserve · Contextualise · Publish
          </p>
          <a
            href="mailto:hello@mypahlavi.com"
            className="inline-block pt-1 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            hello@mypahlavi.com
          </a>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-14 gap-y-10 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle sm:grid-cols-3"
        >
          <div className="space-y-3">
            <p className="text-ink">Archive</p>
            <Link to="/archive" className="block hover:text-ink">Overview</Link>
            <Link to="/archive/entries" className="block hover:text-ink">Entries</Link>
            <Link to="/archive/collections" className="block hover:text-ink">Collections</Link>
            <Link to="/archive/timeline" className="block hover:text-ink">Timeline</Link>
            <Link to="/archive/plates" className="block hover:text-ink">Plates</Link>
            <Link to="/archive/sources" className="block hover:text-ink">Sources</Link>
          </div>
          <div className="space-y-3">
            <p className="text-ink">Read &amp; look</p>
            <Link to="/library" className="block hover:text-ink">Journal</Link>
            <Link to="/gallery" className="block hover:text-ink">Gallery</Link>
            <Link to="/lineage" className="block hover:text-ink">Century</Link>
          </div>
          <div className="space-y-3">
            <p className="text-ink">MyPahlavi</p>
            <Link to="/editions" className="block hover:text-ink">Editions</Link>
            <Link to="/about" className="block hover:text-ink">About</Link>
          </div>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-10 py-3.5 sm:px-12">
          <span className="text-[0.55rem] tracking-[0.04em] text-ink-subtle/70">
            mypahlavi.com
          </span>
          <span className="hidden text-[0.55rem] text-ink-subtle/60 sm:inline">
            Independent · Research-led · Not an official family website
          </span>
        </div>
      </div>
    </footer>
  );
}
