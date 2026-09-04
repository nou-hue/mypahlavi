import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCartStore } from "@/lib/cart-store";

const nav = [
  { to: "/archive", label: "Archive" },
  { to: "/timeline", label: "Timeline" },
  { to: "/library", label: "Library" },
  { to: "/editions", label: "Editions" },
  { to: "/patronage", label: "The Circle" },
] as const;
function bagLabel(count:number){return count<=0?"Bag":`Bag · ${String(count).padStart(2,"0")}`}
export function SiteHeader({variant="default"}:{variant?:"default"|"ghost"}){
 const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false); const pathname=useRouterState({select:s=>s.location.pathname}); const {user,isPending}=useCurrentUserState(); const openCart=useCartStore(s=>s.openCart); const cartCount=useCartStore(s=>s.count());
 const isHome=pathname==="/"; const wantsGhost=variant==="ghost"&&isHome; const isGhost=wantsGhost&&!scrolled&&!open;
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{if(!wantsGhost){setScrolled(false);return} const onScroll=()=>setScrolled(window.scrollY>window.innerHeight*.55);onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[wantsGhost]);
 useEffect(()=>{if(!open)return;const prev=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=prev}},[open]);
 return <header className={cn("fixed inset-x-0 top-0 z-50 pt-[var(--grok-banner-h,0px)]",isGhost?"text-cream":"text-ink")}><div className={cn("border-b transition-[background-color,border-color,backdrop-filter] duration-300",isGhost?"border-transparent bg-gradient-to-b from-deep/40 via-deep/10 to-transparent":"border-border/70 bg-ground/95 backdrop-blur-md")}><div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-6 px-8 sm:h-[5rem] sm:px-12"><Link to="/" className="shrink-0 font-serif text-[1.15rem] tracking-[0.2em] sm:text-[1.25rem]" aria-label="Pahlavi home">PAHLAVI</Link><div className="hidden min-w-0 flex-1 items-center justify-end gap-7 lg:flex"><nav className="flex items-center gap-6 xl:gap-8" aria-label="Primary">{nav.map(item=><Link key={item.to} to={item.to} className={cn("whitespace-nowrap font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-opacity",pathname===item.to||pathname.startsWith(`${item.to}/`)?"opacity-100":"opacity-[0.55] hover:opacity-100")}>{item.label}</Link>)}</nav><div className="flex items-center border-l border-current/12 pl-6"><button type="button" onClick={openCart} className="inline-flex h-9 items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.16em] opacity-[0.65] hover:opacity-100"><ShoppingBag className="size-4" strokeWidth={1.25}/><span>{bagLabel(cartCount)}</span></button>{!isPending&&user?<SignedIn><div className="ml-4"><UserButton/></div></SignedIn>:null}</div></div><div className="flex items-center lg:hidden"><button type="button" onClick={openCart} className="inline-flex h-11 items-center gap-1.5 px-2" aria-label="Bag"><ShoppingBag className="size-[1.1rem]" strokeWidth={1.25}/>{cartCount>0&&<span className="text-xs">{String(cartCount).padStart(2,"0")}</span>}</button><button type="button" className="inline-flex h-11 w-11 items-center justify-center" aria-label={open?"Close menu":"Open menu"} onClick={()=>setOpen(v=>!v)}>{open?<X className="size-5" strokeWidth={1.25}/>:<Menu className="size-5" strokeWidth={1.25}/>}</button></div></div></div>{open&&<div className={cn("max-h-[calc(100svh-5.5rem)] overflow-y-auto border-b lg:hidden",isGhost||wantsGhost?"border-cream/10 bg-deep text-cream":"border-border bg-ground text-ink")}><nav className="mx-auto flex max-w-[90rem] flex-col px-10 py-7">{nav.map(item=><Link key={item.to} to={item.to} className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-70">{item.label}</Link>)}<Link to="/gallery" className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-55">Gallery</Link><Link to="/lineage" className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-55">People / Century</Link><Link to="/vault" className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-55">Vault</Link><Link to="/about" className="py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] opacity-55">About</Link></nav></div>}</header>
}
