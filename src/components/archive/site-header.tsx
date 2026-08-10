import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCartStore } from "@/lib/cart-store";

const nav = [
  { to: "/gallery", label: "Gallery" },
  { to: "/lineage", label: "Century" },
  { to: "/library", label: "Library" },
  { to: "/vault", label: "Vault" },
  { to: "/editions", label: "Editions" },
  { to: "/patronage", label: "The Circle" },
] as const;

function bagLabel(count: number) {
  if (count <= 0) return "Bag";
  return `Bag · ${String(count).padStart(2, "0")}`;
}

export function SiteHeader({ variant = "default" }: { variant?: "default" | "ghost" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.count());

  const isHome = pathname === "/";
  const wantsGhost = variant === "ghost" && isHome;
  const isGhost = wantsGhost && !scrolled && !open;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!wantsGhost) {
      setScrolled(false);
      return;
    }
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [wantsGhost]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-[var(--grok-banner-h,0px)]",
        isGhost ? "text-cream" : "text-ink",
      )}
    >
      <div
        className={cn(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          isGhost
            ? "border-cream/10 bg-gradient-to-b from-deep/55 via-deep/20 to-transparent"
            : "border-border/70 bg-ground/95 backdrop-blur-md",
        )}
      >
        {/* ~86px desktop, 40–48px horizontal padding */}
        <div className="mx-auto flex h-[5rem] max-w-[90rem] items-center justify-between gap-8 px-10 sm:h-[5.5rem] sm:px-12">
          <Link
            to="/"
            className="shrink-0 font-serif text-[1.25rem] tracking-[0.16em] sm:text-[1.4rem]"
            onClick={() => setOpen(false)}
            aria-label="Pahlavi home"
          >
            PAHLAVI
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-8 lg:flex xl:gap-10">
            <nav className="flex items-center gap-7 xl:gap-9" aria-label="Primary">
              {nav.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "whitespace-nowrap font-sans text-[0.7rem] uppercase tracking-[0.18em] transition-opacity",
                      // ~65% default opacity — intentional, not barely visible
                      active ? "opacity-100" : "opacity-[0.65] hover:opacity-100",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center border-l border-current/12 pl-6">
              <button
                type="button"
                onClick={openCart}
                className="inline-flex h-9 items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.16em] opacity-[0.65] transition-opacity hover:opacity-100"
                aria-label={
                  cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"
                }
              >
                <ShoppingBag className="size-4" strokeWidth={1.25} />
                <span>{bagLabel(cartCount)}</span>
              </button>
              {/* Sign in only when already authenticated (account control) */}
              {!isPending && user ? (
                <SignedIn>
                  <div className="ml-4">
                    <UserButton />
                  </div>
                </SignedIn>
              ) : null}
            </div>
          </div>

          {/* Mobile / tablet — bag icon + menu only */}
          <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
            <button
              type="button"
              onClick={openCart}
              className="inline-flex h-11 items-center gap-1.5 px-2 font-sans text-[0.62rem] uppercase tracking-[0.14em] opacity-75"
              aria-label={cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"}
            >
              <ShoppingBag className="size-[1.1rem]" strokeWidth={1.25} />
              {cartCount > 0 && (
                <span className="tabular-nums">
                  {String(cartCount).padStart(2, "0")}
                </span>
              )}
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="size-5" strokeWidth={1.25} />
              ) : (
                <Menu className="size-5" strokeWidth={1.25} />
              )}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "max-h-[calc(100svh-5.5rem)] overflow-y-auto border-b lg:hidden",
            isGhost || wantsGhost
              ? "border-cream/10 bg-deep text-cream"
              : "border-border bg-ground text-ink",
          )}
        >
          <nav
            className="mx-auto flex max-w-[90rem] flex-col gap-0.5 px-10 py-7 sm:px-12"
            aria-label="Mobile"
          >
            {nav.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em]",
                    active ? "opacity-100" : "opacity-60",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/about"
              className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-60"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <div className="my-3 h-px bg-current/10" />
            <Link
              to="/login"
              className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-45"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
