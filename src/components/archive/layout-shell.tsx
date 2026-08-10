import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { cn } from "@/lib/utils";

export function LayoutShell({
  children,
  ghostHeader = false,
  className,
}: {
  children: ReactNode;
  ghostHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-ground text-ink", className)}>
      <SiteHeader variant={ghostHeader ? "ghost" : "default"} />
      {/* Match taller header: ~5.25rem on sm+ plus optional Grok banner */}
      <div
        className={cn(
          !ghostHeader && "pt-[calc(4.75rem+var(--grok-banner-h,0px))] sm:pt-[calc(5.25rem+var(--grok-banner-h,0px))]",
        )}
      >
        {children}
      </div>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
