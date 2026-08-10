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
  { to: "/patronage", label: "Circle" },
  { to: "/about", label: "About" },
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
  // Ghost only while still over the dark hero plate
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
      {/* Full-width surface so the rule spans the viewport */}
      <div
        className={cn(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          isGhost
            ? "border-cream/15 bg-gradient-to-b from-deep/55 via-deep/20 to-transparent"
            : "border-border/80 bg-ground/95 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:h-16 sm:px-8">
          <Link
            to="/"
            className="shrink-0 font-serif text-lg tracking-[0.08em] sm:text-xl"
            onClick={() => setOpen(false)}
          >
            Pahlavi
          </Link>

          {/* Desktop nav — lg and up */}
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-5 xl:gap-7 lg:flex"
            aria-label="Primary"
          >
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "whitespace-nowrap font-sans text-[0.62rem] uppercase tracking-[0.16em] transition-opacity",
                    active ? "opacity-100" : "opacity-45 hover:opacity-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions — same breakpoint as nav */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {isGhost && (
              <span className="hidden font-sans text-[0.58rem] uppercase tracking-[0.28em] text-cream/70 xl:inline">
                Archive
              </span>
            )}
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 items-center justify-center px-1.5 opacity-70 transition-opacity hover:opacity-100"
              aria-label={`Bag${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.58rem] tabular-nums",
                    isGhost ? "bg-cream text-deep" : "bg-ink text-cream",
                  )}
                >
                  {cartCount}
                </span>
              )}
            </button>
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-current/10" />
            ) : user ? (
              <SignedIn>
                <UserButton />
              </SignedIn>
            ) : (
              <SignedOut>
                <Link
                  to="/login"
                  className="font-sans text-[0.62rem] uppercase tracking-[0.16em] opacity-50 transition-opacity hover:opacity-100"
                >
                  Sign in
                </Link>
              </SignedOut>
            )}
          </div>

          {/* Mobile / tablet — below lg */}
          <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-11 w-11 items-center justify-center"
              aria-label={`Bag${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.58rem]",
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
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      {open && (
        <div
          className={cn(
            "max-h-[calc(100svh-3.5rem)] overflow-y-auto border-b lg:hidden",
            isGhost || wantsGhost
              ? "border-cream/15 bg-deep text-cream"
              : "border-border bg-ground text-ink",
          )}
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 sm:px-8" aria-label="Mobile">
            {nav.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "py-3 font-sans text-sm uppercase tracking-[0.14em]",
                    active ? "opacity-100" : "opacity-60",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="my-2 h-px bg-current/10" />
            <button
              type="button"
              className="py-3 text-left font-sans text-sm uppercase tracking-[0.14em] opacity-60"
              onClick={() => {
                setOpen(false);
                openCart();
              }}
            >
              Bag{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
            <Link
              to="/login"
              className="py-3 font-sans text-sm uppercase tracking-[0.14em] opacity-50"
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
