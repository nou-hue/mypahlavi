import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
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
] as const;

export function SiteHeader({ variant = "default" }: { variant?: "default" | "ghost" }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.count());
  const isGhost = variant === "ghost" && pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-[var(--grok-banner-h,0px)]",
        isGhost ? "text-cream" : "text-ink",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16 sm:px-8",
          isGhost
            ? "border-b border-cream/10 bg-transparent"
            : "border-b border-border/80 bg-ground/90 backdrop-blur-md",
        )}
      >
        <Link
          to="/"
          className="font-serif text-lg tracking-[0.06em] sm:text-xl"
          onClick={() => setOpen(false)}
        >
          Pahlavi
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "font-sans text-[0.62rem] uppercase tracking-[0.16em] transition-opacity",
                  active ? "opacity-100" : "opacity-40 hover:opacity-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-10 items-center gap-2 px-2 font-sans text-[0.65rem] uppercase tracking-[0.14em] opacity-60 transition-opacity hover:opacity-100"
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
                className="font-sans text-[0.65rem] uppercase tracking-[0.16em] opacity-45 transition-opacity hover:opacity-100"
              >
                Sign in
              </Link>
            </SignedOut>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-11 w-11 items-center justify-center"
            aria-label="Bag"
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
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "border-b px-5 py-6 md:hidden",
            isGhost
              ? "border-cream/15 bg-deep text-cream"
              : "border-border bg-ground text-ink",
          )}
        >
          <nav className="flex flex-col gap-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-sans text-sm uppercase tracking-[0.14em]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/about"
              className="font-sans text-sm uppercase tracking-[0.14em]"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <button
              type="button"
              className="text-left font-sans text-sm uppercase tracking-[0.14em]"
              onClick={() => {
                setOpen(false);
                openCart();
              }}
            >
              Bag{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
            <Link
              to="/login"
              className="font-sans text-sm uppercase tracking-[0.14em] opacity-50"
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
