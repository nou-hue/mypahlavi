import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCartStore } from "@/lib/cart-store";

const nav = [
  { to: "/gallery", label: "Gallery" },
  { to: "/lineage", label: "Lineage" },
  { to: "/library", label: "Library" },
  { to: "/editions", label: "Shop" },
  { to: "/patronage", label: "Patronage" },
] as const;

export function SiteHeader({ variant = "default" }: { variant?: "default" | "ghost" }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const ghost = variant === "ghost";
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.count());

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 pt-[var(--grok-banner-h,0px)]",
        ghost ? "text-cream" : "text-ink",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8",
          !ghost && "border-b border-border bg-ground/90 backdrop-blur-md",
          ghost && "bg-gradient-to-b from-deep/50 to-transparent",
        )}
      >
        <Link
          to="/"
          className="font-serif text-xl tracking-tight sm:text-2xl"
          onClick={() => setOpen(false)}
        >
          Pahlavi
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "font-sans text-[0.72rem] uppercase tracking-[0.18em] transition-opacity duration-300",
                  active ? "opacity-100" : "opacity-45 hover:opacity-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={openCart}
            className={cn(
              "relative inline-flex h-10 items-center gap-2 px-2 font-sans text-[0.72rem] uppercase tracking-[0.14em] opacity-70 transition-opacity hover:opacity-100",
            )}
            aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] tabular-nums",
                  ghost ? "bg-cream text-deep" : "bg-ink text-cream",
                )}
              >
                {cartCount}
              </span>
            )}
          </button>
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-ink/10" />
          ) : user ? (
            <SignedIn>
              <UserButton />
            </SignedIn>
          ) : (
            <SignedOut>
              <Link
                to="/login"
                className="font-sans text-[0.72rem] uppercase tracking-[0.18em] opacity-60 transition-opacity hover:opacity-100"
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
            aria-label="Open bag"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span
                className={cn(
                  "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem]",
                  ghost ? "bg-cream text-deep" : "bg-ink text-cream",
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
            "border-b border-border px-5 py-6 md:hidden",
            ghost ? "bg-deep text-cream" : "bg-ground text-ink",
          )}
        >
          <nav className="flex flex-col gap-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-sans text-sm uppercase tracking-[0.16em]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              className="text-left font-sans text-sm uppercase tracking-[0.16em]"
              onClick={() => {
                setOpen(false);
                openCart();
              }}
            >
              Bag{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
            <Link
              to="/login"
              className="font-sans text-sm uppercase tracking-[0.16em] opacity-60"
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
