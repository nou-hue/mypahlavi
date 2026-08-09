import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-2">
          <p className="font-serif text-xl tracking-tight">mypahlavi</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            Independent archive of the Pahlavi family. Journalism, image, and
            limited editions.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
          <Link to="/gallery" className="hover:text-ink">
            Gallery
          </Link>
          <Link to="/lineage" className="hover:text-ink">
            Lineage
          </Link>
          <Link to="/library" className="hover:text-ink">
            Library
          </Link>
          <Link to="/editions" className="hover:text-ink">
            Editions
          </Link>
          <Link to="/patronage" className="hover:text-ink">
            Patronage
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl px-5 py-4 text-[0.65rem] text-ink-subtle sm:px-8 sm:justify-between">
          <span>© mypahlavi.com</span>
          <span className="hidden sm:inline">Not an official family website</span>
        </div>
      </div>
    </footer>
  );
}
