import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
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
            ? "border-cream/10 bg-gradient-to-b from-deep/50 via-deep/15 to-transparent"
            : "border-border/70 bg-ground/95 backdrop-blur-md",
        )}
      >
        {/* ~76px vertical, 40–48px horizontal breathing room */}
        <div className="mx-auto flex h-[4.75rem] max-w-[90rem] items-center justify-between gap-6 px-10 sm:h-[5.25rem] sm:px-12">
          <Link
            to="/"
            className="shrink-0 font-serif text-[1.35rem] tracking-[0.14em] sm:text-[1.5rem]"
            onClick={() => setOpen(false)}
            aria-label="Pahlavi home"
          >
            PAHLAVI
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-8 lg:flex xl:gap-10">
            <nav className="flex items-center gap-6 xl:gap-8" aria-label="Primary">
              {nav.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "whitespace-nowrap font-sans text-[0.68rem] uppercase tracking-[0.18em] transition-opacity",
                      active ? "opacity-100" : "opacity-40 hover:opacity-100",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4 border-l border-current/15 pl-6">
              <button
                type="button"
                onClick={openCart}
                className="relative inline-flex h-9 w-9 items-center justify-center opacity-50 transition-opacity hover:opacity-100"
                aria-label={
                  cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"
                }
              >
                <ShoppingBag className="size-[1.05rem]" strokeWidth={1.25} />
                {cartCount > 0 && (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[0.55rem] tabular-nums leading-none",
                      isGhost ? "bg-cream text-deep" : "bg-ink text-cream",
                    )}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              {isPending ? (
                <div className="h-7 w-7 animate-pulse rounded-full bg-current/10" />
              ) : user ? (
                <SignedIn>
                  <UserButton />
                </SignedIn>
              ) : (
                <SignedOut>
                  <Link
                    to="/login"
                    className="font-sans text-[0.62rem] uppercase tracking-[0.16em] opacity-35 transition-opacity hover:opacity-80"
                  >
                    Sign in
                  </Link>
                </SignedOut>
              )}
            </div>
          </div>

          {/* Mobile / tablet */}
          <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-11 w-11 items-center justify-center opacity-70"
              aria-label={cartCount > 0 ? `Bag, ${cartCount} items` : "Bag"}
            >
              <ShoppingBag className="size-5" strokeWidth={1.25} />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[0.55rem]",
                    isGhost ? "bg-cream text-deep" : "bg-ink text-cream",
                  )}
                >
                  {cartCount}
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
              {open ? <X className="size-5" strokeWidth={1.25} /> : <Menu className="size-5" strokeWidth={1.25} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "max-h-[calc(100svh-5rem)] overflow-y-auto border-b lg:hidden",
            isGhost || wantsGhost
              ? "border-cream/10 bg-deep text-cream"
              : "border-border bg-ground text-ink",
          )}
        >
          <nav
            className="mx-auto flex max-w-[90rem] flex-col gap-0.5 px-10 py-6 sm:px-12"
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
                    "py-3.5 font-sans text-[0.75rem] uppercase tracking-[0.16em]",
                    active ? "opacity-100" : "opacity-55",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/about"
              className="py-3.5 font-sans text-[0.75rem] uppercase tracking-[0.16em] opacity-55"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <div className="my-3 h-px bg-current/10" />
            <Link
              to="/login"
              className="py-3.5 font-sans text-[0.75rem] uppercase tracking-[0.16em] opacity-40"
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
