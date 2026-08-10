import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-serif text-xl tracking-[0.06em]">Pahlavi</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            An independent archive documenting the people, culture, images and
            modern history surrounding the Pahlavi era and its continuing legacy.
          </p>
          <p className="pt-1 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
            Preserve · Document · Contextualise · Curate
          </p>
          <a
            href="mailto:hello@mypahlavi.com"
            className="inline-block pt-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            hello@mypahlavi.com
          </a>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-ink-subtle">
          <Link to="/gallery" className="hover:text-ink">
            Gallery
          </Link>
          <Link to="/lineage" className="hover:text-ink">
            Century
          </Link>
          <Link to="/library" className="hover:text-ink">
            Library
          </Link>
          <Link to="/vault" className="hover:text-ink">
            Vault
          </Link>
          <Link to="/editions" className="hover:text-ink">
            Editions
          </Link>
          <Link to="/patronage" className="hover:text-ink">
            Circle
          </Link>
          <Link to="/about" className="hover:text-ink">
            About
          </Link>
          <a href="mailto:hello@mypahlavi.com" className="hover:text-ink">
            Contact
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl px-5 py-4 text-[0.62rem] text-ink-subtle sm:px-8 sm:justify-between">
          <span>© mypahlavi.com</span>
          <span className="hidden sm:inline">
            Independent · Not an official family website
          </span>
        </div>
      </div>
    </footer>
  );
}
