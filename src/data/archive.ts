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
      "Second and last reigning Shah of the Pahlavi dynasty (1941–1979). Oversaw modernization programs including land reform, education expansion, and industrial growth.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["mohammad-reza"],
    tags: ["Shah", "1941–1979"],
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
      "Empress consort and cultural patron. Championed arts, architecture, museums, and education. Continues archival and cultural work in exile.",
    portraitGradient: "from-[#35302a] via-[#524840] to-[#161412]",
    portraitSrc: portraitMap["farah"],
    tags: ["Shahbanu", "Arts"],
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
      "Coronation, state visits, and the quiet labour of institutions that outlast any single reign.",
    body: `Ceremony is often mistaken for ornament. In the Pahlavi century it was also a grammar — a way of telling a nation what modernity might look like when worn as cloth and timed as procession.

The coronation of Mohammad Reza Shah and Farah Pahlavi remains one of the archive's brightest rooms. Gold reads as gravity, not costume. The camera does not merely record power; it arranges it.

Elsewhere the grammar softens: Finland in winter light, Washington handshakes, Mehrabad arrivals. Protocol becomes weather. The same faces move between rooms, and the dynasty becomes legible as a sequence of thresholds.

This site is independent. It does not speak for any court. It speaks for careful looking.`,
    tags: ["Coronation", "State", "Method"],
  },
  {
    id: "l-03",
    kind: "letter",
    title: "A note left in the reading room",
    author: "Archive host",
    year: "—",
    excerpt:
      "For visitors who come seeking spectacle and find, instead, a quieter kind of attention.",
    body: `If you have come for noise, you may leave disappointed.

If you have come for a room — for type that breathes, for a portrait that holds, for a family tree that does not rush — then stay.

The Pahlavi story is large: reform and rupture, glamour and exile, love of country argued in different tongues. We do not flatten it. We stage it. Gallery rooms, lineage dossiers, letters, editions.

Patronage keeps the lights soft and the plates sharp. Shop objects fund digitization without turning the museum into a marketplace. Everything is designed to feel commissioned rather than sold.

Walk slowly. The archive will meet you halfway.`,
    tags: ["Welcome", "Patronage"],
  },
  {
    id: "l-04",
    kind: "essay",
    title: "Exile rearranges an archive",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt:
      "After 1979, what was left behind and what was carried — and how memory travels in suitcases and foundations.",
    body: `Exile does not end a dynasty's image life. It splits it.

Some photographs never left Iran. Others crossed borders in envelopes, museums, newspapers, and private hands. Funeral rites, foreign residences, the long work of speaking about home from elsewhere — these become rooms of their own.

Farah Pahlavi's later portraits carry a different light: less ceremony, more endurance. Crown Prince Reza's public life continues the family as argument and hope rather than court calendar.

We place exile beside coronation so that continuity and rupture can be seen in one house. Completeness is not our claim. Care is.`,
    tags: ["Exile", "Memory"],
  },
  {
    id: "l-05",
    kind: "book",
    title: "Notes on reading the lineage",
    author: "Archive reader",
    year: "—",
    excerpt:
      "How to walk the family tree: generations, titles, and the difference between public duty and private life.",
    body: `Begin with Reza Shah — founder of the dynasty in 1925, architect of a stern modern state.

Move to the second generation: Mohammad Reza Shah; Princess Ashraf, diplomat and twin flame of influence; Princess Shams. Enter Farah Pahlavi as Shahbanu — patron of arts, museums, and a cultural ambition that still shapes Tehran's memory of itself.

The third generation — Reza, Farahnaz, Ali Reza, Leila — asks for gentleness. Public titles sit beside private loss. The tree is a journey, not a spreadsheet. Portraits lead; dossiers open only when invited.

Accuracy is a duty. Humility about incomplete sources is another.`,
    tags: ["Lineage", "Guide"],
  },
  {
    id: "l-06",
    kind: "essay",
    title: "Farah, and the idea of a modern court of culture",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt:
      "How the Shahbanu's patronage of museums, architecture, and the arts still shapes what \"modern Iran\" can mean.",
    body: `Farah Pahlavi understood that a court could be a cultural instrument.

Museums, festivals, architecture, and the insistence that Iranian modernity need not discard beauty — these are part of her public signature. In photographs she is often composure itself: a vertical calm against the horizontal noise of state.

When she appears beside Mohammad Reza Shah, the frame tightens. Partnership becomes visible without needing a slogan. That is why our home image chooses them together — a rare shared moment, held like an heirloom rather than a headline.

This essay is not hagiography. It is an invitation to look at cultural ambition as seriously as we look at politics.`,
    tags: ["Farah", "Culture", "Arts"],
  },
  {
    id: "l-07",
    kind: "letter",
    title: "On the duties of a digital wing",
    author: "Court correspondence (composite)",
    year: "1950s / 2026",
    excerpt:
      "A composite reflection: ceremony as trust, and the labour of institutions that should outlast personality.",
    body: `The old letters speak of schools, hospitals, roads — and of the fragile hope that institutions might become stronger than the personalities who open them.

Our digital wing inherits that hope in a smaller key. We build rooms, not feeds. We attribute sources. We sell editions only as commissions that keep the archive alive.

If ceremony was once a public language, then curation is one now: the way we frame a face, the words we place beneath it, the patience we ask of a visitor.

Read slowly. Paper still matters, even when the paper is light.`,
    tags: ["Institutions", "Method"],
  },
  {
    id: "l-08",
    kind: "essay",
    title: "Frames, mats, and the ethics of display",
    author: "mypahlavi editorial",
    year: "2026",
    excerpt:
      "Why dark brown wood, a pale mat, and a thin border are not decoration — they are respect.",
    body: `An unframed image on a bright website floats. A framed plate sits.

We chose a dark brown frame — near walnut, near palace wood — with a pale mat and a thin inner line so each photograph is received as an object. Hard-to-see historical exposures are gently lifted for legibility; we do not repaint faces.

Display is an ethic. The same ethic guides captions, lineage dossiers, and the refusal to turn mourning into merch. Editions exist; spectacle does not.

If the frame feels heavy, good. Memory should have weight.`,
    tags: ["Design", "Gallery"],
  },
];

export const patronageTiers = [
  {
    id: "visitor",
    name: "Visitor",
    price: "Free",
    description: "Enter the public rooms of the archive.",
    perks: [
      "Browse curated gallery sequences",
      "Explore the family lineage",
      "Read selected essays and letters",
      "Shop archive editions",
    ],
  },
  {
    id: "patron",
    name: "Patron",
    price: "£12 / month",
    description: "Quiet support for digitization and new rooms.",
    perks: [
      "Higher-resolution viewing",
      "Early access to new exhibitions",
      "Expanded reading-room texts",
      "Digital certificate of patronage",
    ],
  },
  {
    id: "benefactor",
    name: "Benefactor",
    price: "£40 / month",
    description: "Closer partnership with the archive's growth.",
    perks: [
      "Everything in Patron",
      "Private preview of upcoming editions",
      "Downloadable study plates (where rights allow)",
      "Named thanks in annual archive note",
    ],
  },
];

export const rooms = [
  { id: "all", label: "All rooms" },
  { id: "early", label: "Early dynasty" },
  { id: "coronation", label: "Coronation" },
  { id: "family", label: "Family life" },
  { id: "state", label: "State & ceremony" },
  { id: "exile", label: "Exile years" },
] as const;

export function getMember(id: string) {
  return familyMembers.find((m) => m.id === id);
}

export function imagesForMember(id: string) {
  return galleryImages.filter((g) => g.personIds.includes(id));
}
