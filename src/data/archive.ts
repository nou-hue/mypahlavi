import galleryJson from "./gallery-images.json";
import portraitsJson from "./portraits.json";

export type FamilyMember = {
  id: string;
  name: string;
  title: string;
  years: string;
  generation: number;
  parentIds: string[];
  summary: string;
  portraitGradient: string;
  portraitSrc?: string;
  tags: string[];
};

export type GalleryImage = {
  id: string;
  title: string;
  year: string;
  place: string;
  personIds: string[];
  room: "coronation" | "family" | "state" | "exile" | "early" | string;
  caption: string;
  cardCaption?: string;
  sourceNote: string;
  src?: string;
  gradient: string;
  aspect: "portrait" | "landscape" | "square" | string;
  folder?: string;
  license?: string;
};

export type LibraryItem = {
  id: string;
  kind: "letter" | "essay" | "book";
  title: string;
  author: string;
  year: string;
  excerpt: string;
  body: string;
  tags: string[];
};

export type Edition = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: "print" | "apparel" | "object";
  gradient: string;
};

export { editions, shopProducts } from "@/data/shop";

const portraitMap = portraitsJson as Record<string, string>;

export const familyMembers: FamilyMember[] = [
  {
    id: "reza-shah",
    name: "Reza Shah Pahlavi",
    title: "Founder of the Pahlavi Dynasty",
    years: "1878 – 1944",
    generation: 1,
    parentIds: [],
    summary:
      "Soldier and statesman who founded the Pahlavi dynasty in 1925. His reign accelerated modern institutions, infrastructure, and legal reform across Iran.",
    portraitGradient: "from-[#3a342c] via-[#5c5246] to-[#1a1814]",
    portraitSrc: portraitMap["reza-shah"],
    tags: ["Founder", "1925–1941"],
  },
  {
    id: "tadj-ol-molouk",
    name: "Tadj ol-Molouk",
    title: "Queen Mother",
    years: "1896 – 1982",
    generation: 1,
    parentIds: [],
    summary:
      "Queen consort of Reza Shah and mother of Mohammad Reza Shah. A central figure in the early court and later years of exile.",
    portraitGradient: "from-[#4a4038] via-[#6b5d52] to-[#221e1a]",
    tags: ["Queen Mother"],
  },
  {
    id: "mohammad-reza",
    name: "Mohammad Reza Shah",
    title: "Shahanshah of Iran",
    years: "1919 – 1980",
    generation: 2,
    parentIds: ["reza-shah", "tadj-ol-molouk"],
    summary:
      "Second and last reigning Shah of the Pahlavi dynasty (1941–1979). Three marriages: Fawzia (Fawzieh) of Egypt, Queen Soraya, and Shahbanu Farah.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["mohammad-reza"],
    tags: ["Shah", "1941–1979"],
  },
  {
    id: "fawzia",
    name: "Princess Fawzia (Fawzieh)",
    title: "First Queen consort",
    years: "1921 – 2013",
    generation: 2,
    parentIds: [],
    summary:
      "Princess Fawzia Fuad of Egypt — known in Persian as Fawzieh (فوزیه) — first wife of Mohammad Reza Shah (1939–1948). Sister of King Farouk. Mother of Princess Shahnaz. Distinct from Queen Soraya and Shahbanu Farah.",
    portraitGradient: "from-[#3a342e] via-[#564c44] to-[#1a1614]",
    portraitSrc: portraitMap["fawzia"],
    tags: ["Queen consort", "1939–1948", "Egypt"],
  },
  {
    id: "soraya",
    name: "Queen Soraya",
    title: "Second Queen consort",
    years: "1932 – 2001",
    generation: 2,
    parentIds: [],
    summary:
      "Soraya Esfandiary-Bakhtiary — second wife of Mohammad Reza Shah (1951–1958). The lady in emerald satin and diamond cascade. Not Fawzia (first) and not Farah (third).",
    portraitGradient: "from-[#2f2a24] via-[#4e453c] to-[#141210]",
    portraitSrc: portraitMap["soraya"],
    tags: ["Queen consort", "1951–1958"],
  },
  {
    id: "ashraf",
    name: "Princess Ashraf Pahlavi",
    title: "Twin sister of the Shah",
    years: "1919 – 2016",
    generation: 2,
    parentIds: ["reza-shah", "tadj-ol-molouk"],
    summary:
      "Diplomat, philanthropist, and advocate for women's rights. Founded the Foundation for Iranian Studies and represented Iran at the United Nations.",
    portraitGradient: "from-[#3d3530] via-[#5a4e46] to-[#1a1614]",
    portraitSrc: portraitMap["ashraf"],
    tags: ["Princess", "Diplomat"],
  },
  {
    id: "shams",
    name: "Princess Shams Pahlavi",
    title: "Elder sister of the Shah",
    years: "1917 – 1996",
    generation: 2,
    parentIds: ["reza-shah", "tadj-ol-molouk"],
    summary:
      "Philanthropist and cultural patron. Led Red Lion and Sun Society initiatives and supported educational projects.",
    portraitGradient: "from-[#403830] via-[#5e5248] to-[#1c1814]",
    portraitSrc: portraitMap["shams"],
    tags: ["Princess"],
  },
  {
    id: "farah",
    name: "Farah Pahlavi",
    title: "Shahbanu of Iran",
    years: "1938 –",
    generation: 2,
    parentIds: [],
    summary:
      "Third wife of Mohammad Reza Shah (married 1959); crowned Shahbanu in 1967. Cultural patron of arts, architecture, museums, and education. Mother of Reza, Farahnaz, Ali Reza, and Leila. Distinct from Fawzia (first) and Soraya (second).",
    portraitGradient: "from-[#35302a] via-[#524840] to-[#161412]",
    portraitSrc: portraitMap["farah"],
    tags: ["Shahbanu", "Arts", "1959–"],
  },
  {
    id: "shahnaz",
    name: "Princess Shahnaz",
    title: "Princess of Iran",
    years: "1940 –",
    generation: 3,
    parentIds: ["mohammad-reza", "fawzia"],
    summary:
      "Only child of Mohammad Reza Shah and Princess Fawzia (Fawzieh) of Egypt. The bridge between the first marriage and the later imperial household.",
    portraitGradient: "from-[#38322c] via-[#554c42] to-[#181512]",
    tags: ["Princess", "Fawzia line"],
  },
  {
    id: "reza",
    name: "Reza Pahlavi",
    title: "Crown Prince",
    years: "1960 –",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Eldest son of Mohammad Reza Shah and Farah Pahlavi. Designated Crown Prince in 1967. Lives in exile and advocates for a democratic, secular future for Iran.",
    portraitGradient: "from-[#2a2622] via-[#464038] to-[#12100e]",
    portraitSrc: portraitMap["reza"],
    tags: ["Crown Prince"],
  },
  {
    id: "farahnaz",
    name: "Princess Farahnaz",
    title: "Princess of Iran",
    years: "1963 –",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Daughter of Mohammad Reza Shah and Farah Pahlavi. Maintains a private life while remaining part of the family historical record.",
    portraitGradient: "from-[#38322c] via-[#554c42] to-[#181512]",
    tags: ["Princess"],
  },
  {
    id: "ali-reza",
    name: "Prince Ali Reza",
    title: "Prince of Iran",
    years: "1966 – 2011",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Younger son of the Shah and Shahbanu. Studied ancient Iranian languages and history; remembered for scholarly interests and quiet dignity.",
    portraitGradient: "from-[#302c28] via-[#4a443c] to-[#141210]",
    tags: ["Prince"],
  },
  {
    id: "leila",
    name: "Princess Leila",
    title: "Princess of Iran",
    years: "1970 – 2001",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Youngest daughter of Mohammad Reza Shah and Farah Pahlavi. Remembered with affection within the family's private history.",
    portraitGradient: "from-[#3a342e] via-[#564c44] to-[#1a1614]",
    tags: ["Princess"],
  },
];

export const galleryImages: GalleryImage[] = (galleryJson as GalleryImage[]).map(
  (g) => ({
    ...g,
    gradient: g.gradient || "from-[#1a1612] via-[#3d342c] to-[#0e0c0a]",
    cardCaption: g.cardCaption || g.caption,
  }),
);

export const libraryItems: LibraryItem[] = [
  {
    id: "l-01",
    kind: "essay",
    title: "The photograph that refuses to hurry",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt:
      "Why an archive should feel like a private wing after hours — and why captions are part of the plate.",
    body: `A photograph of a royal court is never only a face. It is fabric, distance, protocol, weather, and the second before someone speaks.

This archive refuses the scroll. We hang images in dark brown frames with pale mats because objects of memory deserve edges. Captions are not captions in the social sense; they are wall labels — who, when, where, and why the plate still matters.

Mohammad Reza Shah and Farah Pahlavi appear often together here. Not as a branding pair, but as two people who carried the public theatre of a modern monarchy. When they stand side by side — coronation light, an airport threshold, a northern state visit — the archive is allowed a rare softness: history looking back at itself without shouting.

Rights remain the gate. Many plates arrive from open historical collections. Enhancement may lift a dark exposure; it must never invent a history that was not there.`,
    tags: ["Gallery", "Method", "Farah"],
  },
  {
    id: "l-02",
    kind: "essay",
    title: "On ceremony as a public language",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt:
      "Crowns, sashes, and the quiet grammar of state — how ritual photographs still speak.",
    body: `Ceremony is a public language. It tells a room who is meant to be seen, and in what order.

The coronation of Mohammad Reza Shah and Farah Pahlavi remains one of the archive's brightest rooms. Gold reads as gravity, not costume. The camera does not merely record power; it arranges it.

Elsewhere the grammar softens: Finland in winter light, Washington handshakes, Mehrabad arrivals. Protocol becomes weather. The same faces move between rooms, and the dynasty becomes legible as a sequence of thresholds.`,
    tags: ["Coronation", "State"],
  },
  {
    id: "l-03",
    kind: "essay",
    title: "Three queens, one dynasty",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt:
      "Fawzia (Fawzieh), Soraya, Farah — three consorts, carefully named so the archive does not blur them.",
    body: `The Pahlavi court knew three principal queens of Mohammad Reza Shah. Confusing them is a common error of the internet age; this archive will not make it.

Princess Fawzia Fuad of Egypt — Fawzieh (فوزیه) in Persian — married the young Crown Prince in 1939. Their marriage joined two royal houses and produced Princess Shahnaz. It ended in 1948. When you see the 1939 wedding banquet or the Armand studio portrait with the diamond tiara, you are looking at Fawzia.

Queen Soraya Esfandiary-Bakhtiary — the lady in emerald satin, blue-eyed in the 1950s studio light — was queen from 1951 to 1958. Diamond cascade, white feather fan: Soraya, not Farah.

Farah Diba became Shahbanu in a later chapter: marriage in 1959, coronation in 1967, mother of the four children who close the dynasty’s public story. Cultural patronage, museums, architecture — her register is different, and the wall labels say so.

We keep separate folders, separate person chips, separate sentences. Memory is precision.`,
    tags: ["Fawzia", "Soraya", "Farah", "Lineage"],
  },
  {
    id: "l-04",
    kind: "letter",
    title: "A note on looking carefully",
    author: "Archive desk",
    year: "2026",
    excerpt: "What we ask of every visitor who opens a plate.",
    body: `Look twice.

A green gown is not automatically Farah. A tiara is not a single name. Fawzieh is not Soraya; Soraya is not Farah.

If a plate is Fawzia, the label says Fawzia (Fawzieh). If it is Soraya, the label says Soraya. If it is Farah, the label says Farah. That is the least courtesy history is owed.`,
    tags: ["Method"],
  },
  {
    id: "l-05",
    kind: "essay",
    title: "Thresholds of exile",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt: "Airports, foreign rooms, and the long work of memory after 1979.",
    body: `Some photographs never left Iran. Others crossed borders in envelopes, museums, newspapers, and private hands. Funeral rites, foreign residences, the long work of speaking about home from elsewhere — these become rooms of their own.

Exile is not only departure. It is the archive’s second life: how a family remains legible when the palace is closed.`,
    tags: ["Exile", "Memory"],
  },
  {
    id: "l-06",
    kind: "book",
    title: "How to read a wall label",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt: "Year, place, person, and the one sentence that keeps a plate honest.",
    body: `A good wall label does four things: names the person correctly, places the year, allows uncertainty when the archive is unsure, and refuses gossip dressed as history.

Our digital wing inherits museum hope in a smaller key. We build rooms, not feeds. We attribute sources. We sell editions only as commissions that keep the archive alive.`,
    tags: ["Design", "Gallery"],
  },
];

export const rooms = [
  { id: "all", label: "All rooms" },
  { id: "coronation", label: "Coronation" },
  { id: "family", label: "Family" },
  { id: "state", label: "State" },
  { id: "exile", label: "Exile" },
  { id: "early", label: "Early court" },
];

export function getMember(id: string) {
  return familyMembers.find((m) => m.id === id);
}

export function imagesForMember(id: string) {
  return galleryImages.filter((g) => g.personIds.includes(id));
}

export const siteNav = [
  {
    to: "/gallery",
    label: "Gallery",
    description: "Enter the public rooms of the archive.",
  },
  {
    to: "/lineage",
    label: "Lineage",
    description: "An interactive family tree.",
  },
  {
    to: "/library",
    label: "Library",
    description: "Essays, letters, and books.",
  },
  {
    to: "/editions",
    label: "Shop",
    description: "Print-on-demand editions.",
  },
  {
    to: "/patronage",
    label: "Patronage",
    description: "Quiet support for digitization and new rooms.",
  },
];
