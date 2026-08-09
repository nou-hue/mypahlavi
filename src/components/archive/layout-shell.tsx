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
      <div className={cn(!ghostHeader && "pt-[calc(4rem+var(--grok-banner-h,0px))]")}>
        {children}
      </div>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
