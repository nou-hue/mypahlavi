/**
 * Vault rooms — restrained archive layers.
 * Visual fragments use existing public gallery assets only.
 * Where no authentic fragment exists, the plate is intentionally empty.
 */

export type VaultRoomId = "photography" | "documents" | "film" | "objects";

export type VaultRoom = {
  id: VaultRoomId;
  slug: VaultRoomId;
  meta: string;
  title: string;
  desc: string;
  note: string;
  /** Existing gallery image paths — partial presentation only */
  fragments: Array<{
    src: string;
    alt: string;
    /** CSS object-position for partial reveal */
    position?: string;
    /** crop aspect treatment */
    aspect?: "strip" | "sheet" | "detail" | "empty";
  }>;
};

export const vaultRooms: VaultRoom[] = [
  {
    id: "photography",
    slug: "photography",
    meta: "VAULT · 01",
    title: "Unpublished photography",
    desc: "Contact sheets, private moments, and alternate takes held back from the public hang.",
    note: "Material selected for study and eventual careful release. Not all plates enter the public Gallery.",
    fragments: [
      {
        src: "/archive/other-family/user-garden-laughter-with-baby.jpg",
        alt: "Private garden moment — contact-sheet fragment",
        position: "30% 40%",
        aspect: "sheet",
      },
      {
        src: "/archive/other-family/user-terrace-umbrella-casual.jpg",
        alt: "Terrace alternate take — partial plate",
        position: "50% 20%",
        aspect: "detail",
      },
      {
        src: "/archive/reza-pahlavi/user-young-reza-on-throne.jpg",
        alt: "Young Crown Prince — held from public hang",
        position: "center",
        aspect: "detail",
      },
    ],
  },
  {
    id: "documents",
    slug: "documents",
    meta: "VAULT · 02",
    title: "Documents & correspondence",
    desc: "Letters, briefs, and papers where the record allows — each release accompanied by contextual notes.",
    note: "Document releases require provenance notes. Frames left empty until authentic material is prepared.",
    fragments: [
      // No fabricated documents — intentional empty frames
      { src: "", alt: "", aspect: "empty" },
      { src: "", alt: "", aspect: "empty" },
    ],
  },
  {
    id: "film",
    slug: "film",
    meta: "VAULT · 03",
    title: "Film & moving image",
    desc: "Rare footage and stills from ceremonial, diplomatic, and private settings.",
    note: "Moving-image rooms open as digitisation permits. Stills shown as strip fragments only.",
    fragments: [
      {
        src: "/archive/other-family/user-coronation-couple-black-uniform.jpg",
        alt: "Ceremonial still — frame fragment",
        position: "40% 30%",
        aspect: "strip",
      },
      {
        src: "/archive/farah-pahlavi/user-airport-arrival-flowers-bw.jpg",
        alt: "Arrival still — frame fragment",
        position: "60% 50%",
        aspect: "strip",
      },
      {
        src: "/archive/mohammad-reza-shah/user-street-walk-light-suit.jpg",
        alt: "Street still — frame fragment",
        position: "50% 40%",
        aspect: "strip",
      },
    ],
  },
  {
    id: "objects",
    slug: "objects",
    meta: "VAULT · 04",
    title: "Objects & ephemera",
    desc: "Textiles, medals, scans, and material culture documented for the collection — study images, not a shop floor.",
    note: "Study photography only. Distinct from Editions — these are collection records, not merchandise.",
    fragments: [
      {
        src: "/archive/farah-pahlavi/user-farah-coronation-crown-ermine.jpg",
        alt: "Regalia detail — study crop",
        position: "50% 15%",
        aspect: "detail",
      },
      {
        src: "/archive/farah-pahlavi/user-farah-profile-tiara-braid-bw.jpg",
        alt: "Detail plate — study crop",
        position: "50% 25%",
        aspect: "detail",
      },
    ],
  },
];

export function getVaultRoom(slug: string) {
  return vaultRooms.find((r) => r.slug === slug || r.id === slug);
}
