import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ground">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-12 px-10 py-16 sm:px-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-4">
          <p className="font-serif text-2xl tracking-[0.14em]">PAHLAVI</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            An independent archive documenting the people, culture, images and
            modern history surrounding the Pahlavi era and its continuing legacy.
          </p>
          <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-subtle">
            Preserve · Document · Contextualise · Curate
          </p>
          <a
            href="mailto:hello@mypahlavi.com"
            className="inline-block pt-1 text-sm text-ink-muted transition-colors hover:text-ink"
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
            The Circle
          </Link>
          <Link to="/about" className="hover:text-ink">
            About
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-10 py-4 text-[0.58rem] text-ink-subtle sm:px-12">
          <span>mypahlavi.com</span>
          <span className="hidden opacity-70 sm:inline">
            Independent · Not an official family website
          </span>
        </div>
      </div>
    </footer>
  );
}
