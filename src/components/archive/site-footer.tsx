import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ground-elevated">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md space-y-3">
          <p className="font-serif text-2xl tracking-tight">mypahlavi.com</p>
          <p className="text-sm leading-relaxed text-ink-muted">
            An independent digital archive of the Pahlavi family — spatial, calm,
            and carefully sourced. Not an official family site.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink-subtle">
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
            Shop
          </Link>
          <Link to="/checkout" className="hover:text-ink">
            Checkout
          </Link>
          <Link to="/patronage" className="hover:text-ink">
            Patronage
          </Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-ink-subtle sm:flex-row sm:justify-between sm:px-8">
          <span>Independent archival project</span>
          <span>Shop fulfilled via Printify · Provenance first</span>
        </div>
      </div>
    </footer>
  );
}
