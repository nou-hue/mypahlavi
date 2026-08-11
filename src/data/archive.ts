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
  featured?: boolean;
  rotate?: number;
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

/**
 * Public lineage — documentary chronology of the House.
 * Farah as Shahbanu of record for Gen 2; Gen 3 includes Shahnaz (earlier marriage)
 * and the four children of the late reign. Gen 4: daughters of Reza & Yasmine,
 * with Iryana Leila on the separate Ali Reza branch.
 * Portraits: authentic archival / official photography only — never fabricated.
 */
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
      "Queen consort of Reza Shah and mother of Mohammad Reza Shah. A central figure of the early court and later years of exile.",
    portraitGradient: "from-[#4a4038] via-[#6b5d52] to-[#221e1a]",
    portraitSrc: portraitMap["tadj-ol-molouk"],
    tags: ["Queen Mother"],
  },
  {
    id: "mohammad-reza",
    name: "Mohammad Reza Shah Pahlavi",
    title: "Shahanshah of Iran",
    years: "1919 – 1980",
    generation: 2,
    parentIds: ["reza-shah", "tadj-ol-molouk"],
    summary:
      "Second and last reigning Shah of the Pahlavi dynasty (1941–1979). His reign saw land reform, education expansion, and industrial growth — and, finally, revolution and exile.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["mohammad-reza"],
    tags: ["Shah", "1941–1979"],
  },
  {
    id: "farah",
    name: "Farah Pahlavi",
    title: "Shahbanu of Iran",
    years: "b. 1938",
    generation: 2,
    parentIds: [],
    summary:
      "Wife of Mohammad Reza Shah, crowned Empress in 1967. Patron of culture and mother of the four children of the late reign.",
    portraitGradient: "from-[#3d342c] via-[#6b5a48] to-[#1a1612]",
    portraitSrc: portraitMap["farah"],
    tags: ["Shahbanu", "1959–"],
  },
  {
    id: "shahnaz",
    name: "Princess Shahnaz Pahlavi",
    title: "Daughter of Mohammad Reza Shah",
    years: "b. 1940",
    generation: 3,
    parentIds: ["mohammad-reza"],
    summary:
      "Eldest daughter of Mohammad Reza Shah, from his marriage to Princess Fawzia of Egypt. A presence of the early reign.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["shahnaz"],
    tags: ["Princess"],
  },
  {
    id: "reza",
    name: "Reza Pahlavi",
    title: "Crown Prince · Head of the House",
    years: "b. 1960",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Eldest son of Mohammad Reza Shah and Farah Pahlavi. Heir to the Pahlavi line; father of Noor, Iman, and Farah.",
    portraitGradient: "from-[#2a2620] via-[#4a4038] to-[#12100e]",
    portraitSrc: portraitMap["reza"],
    tags: ["Crown Prince"],
  },
  {
    id: "farahnaz",
    name: "Princess Farahnaz Pahlavi",
    title: "Daughter of Mohammad Reza Shah and Farah",
    years: "b. 1963",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary: "Second child of the Shah and Shahbanu Farah.",
    portraitGradient: "from-[#3a342c] via-[#5c5246] to-[#1a1814]",
    portraitSrc: portraitMap["farahnaz"],
    tags: ["Princess"],
  },
  {
    id: "ali-reza",
    name: "Prince Ali Reza Pahlavi",
    title: "Son of Mohammad Reza Shah and Farah",
    years: "1966 – 2011",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Second son of the late Shah and Shahbanu Farah. Father of Iryana Leila Pahlavi.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["ali-reza"],
    tags: ["Prince"],
  },
  {
    id: "leila",
    name: "Princess Leila Pahlavi",
    title: "Daughter of Mohammad Reza Shah and Farah",
    years: "1970 – 2001",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary: "Youngest child of the Shah and Shahbanu Farah.",
    portraitGradient: "from-[#3d342c] via-[#5a5048] to-[#1a1612]",
    portraitSrc: portraitMap["leila"],
    tags: ["Princess"],
  },
  {
    id: "yasmine",
    name: "Yasmine Pahlavi",
    title: "Wife of Reza Pahlavi",
    years: "b. 1968",
    generation: 3,
    parentIds: [],
    summary:
      "Married to Reza Pahlavi; mother of Noor, Iman, and Farah. Presented here for lineage clarity, not as a child of the late Shah.",
    portraitGradient: "from-[#3a342c] via-[#5c5246] to-[#1a1814]",
    // No free-licensed official portrait available — archival placeholder used
    portraitSrc: portraitMap["yasmine"],
    tags: ["Family"],
  },
  {
    id: "noor",
    name: "Noor Pahlavi",
    title: "Daughter of Reza and Yasmine Pahlavi",
    years: "b. 1992",
    generation: 4,
    parentIds: ["reza", "yasmine"],
    summary:
      "Eldest daughter of Reza Pahlavi and Yasmine Pahlavi. Part of the living generation of the house.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["noor"],
    tags: ["Living generation"],
  },
  {
    id: "iman",
    name: "Iman Pahlavi",
    title: "Daughter of Reza and Yasmine Pahlavi",
    years: "b. 1993",
    generation: 4,
    parentIds: ["reza", "yasmine"],
    summary:
      "Second daughter of Reza Pahlavi and Yasmine Pahlavi.",
    portraitGradient: "from-[#3a342c] via-[#5c5246] to-[#1a1814]",
    portraitSrc: portraitMap["iman"],
    tags: ["Living generation"],
  },
  {
    id: "farah-d",
    name: "Farah Pahlavi",
    title: "Daughter of Reza and Yasmine Pahlavi",
    years: "b. 2004",
    generation: 4,
    parentIds: ["reza", "yasmine"],
    summary:
      "Youngest daughter of Reza Pahlavi and Yasmine Pahlavi. Shares a name with her grandmother, the Shahbanu.",
    portraitGradient: "from-[#2a2620] via-[#4a4038] to-[#12100e]",
    portraitSrc: portraitMap["farah-d"],
    tags: ["Living generation"],
  },
  {
    id: "iryana-leila",
    name: "Iryana Leila Pahlavi",
    title: "Daughter of Prince Ali Reza Pahlavi",
    years: "b. 2011",
    generation: 4,
    parentIds: ["ali-reza"],
    summary:
      "Daughter of the late Prince Ali Reza Pahlavi. Represented on the Ali Reza branch — not a child of Reza and Yasmine.",
    portraitGradient: "from-[#3d342c] via-[#5a5048] to-[#1a1612]",
    portraitSrc: portraitMap["iryana-leila"],
    tags: ["Ali Reza branch"],
  },
];

export const galleryImages: GalleryImage[] = (galleryJson as GalleryImage[])
  .map((g) => ({
    ...g,
    gradient: g.gradient || "from-[#1a1612] via-[#3d342c] to-[#0e0c0a]",
    cardCaption: g.cardCaption || g.caption,
  }))
  .filter((g) => Boolean(g.src));

export const gallerySelection = galleryImages.filter((g) => g.featured);

export const libraryItems: LibraryItem[] = [
  {
    id: "l-01",
    kind: "essay",
    title: "The private frame",
    author: "mypahlavi",
    year: "2026",
    excerpt:
      "What a single photograph of a royal household can still say — if you give it room.",
    body: `A photograph of a court is never only a face. It is fabric, distance, protocol, weather, and the second before someone speaks.\n\nThis collection treats images as primary documents. Captions name who is present, when the frame was made, and what the moment was for. The rest is left to the viewer.\n\nMohammad Reza Shah and Farah Pahlavi appear often together here — coronation light, airport thresholds, northern visits, private gardens. The aim is precision, not nostalgia.`,
    tags: ["Photography", "Method"],
  },
  {
    id: "l-02",
    kind: "essay",
    title: "Ceremony as a public language",
    author: "mypahlavi",
    year: "2026",
    excerpt:
      "Crowns, sashes, and the grammar of state — how ritual photographs still read.",
    body: `Ceremony tells a room who is meant to be seen, and in what order.\n\nThe 1967 coronation remains one of the brightest sequences in this archive: gold as gravity, not costume. Elsewhere the grammar softens — winter light in Finland, handshakes in Washington, arrivals at Mehrabad. Protocol becomes weather.\n\nRead across the decades and a dynasty becomes a sequence of thresholds.`,
    tags: ["Coronation", "State"],
  },
  {
    id: "l-03",
    kind: "essay",
    title: "Shahbanu",
    author: "mypahlavi",
    year: "2026",
    excerpt:
      "Farah Pahlavi — empress, patron, and mother of the late reign’s children.",
    body: `Farah Diba married Mohammad Reza Shah in 1959 and was crowned Shahbanu in 1967. The photographs of that household — state arrivals, cultural patronage, private gardens — form the core of this collection’s modern chapter.\n\nHer work in museums, universities, and the arts is a separate story from coronation light alone. Here she is held as the imperial consort of record for the image hang: precise names, careful years, no confusions of identity.`,
    tags: ["Farah", "Shahbanu"],
  },
  {
    id: "l-04",
    kind: "letter",
    title: "On looking carefully",
    author: "Archive desk",
    year: "2026",
    excerpt: "A short note to the reader of this collection.",
    body: `A tiara is not a single decade. A garden is not a myth.\n\nWe publish with the assumption that readers want accuracy — year, place, person — more than atmosphere. If a plate is incomplete, the caption says so. If a plate is strong, it is allowed to stand without decoration.`,
    tags: ["Editorial"],
  },
  {
    id: "l-05",
    kind: "essay",
    title: "After the palace",
    author: "mypahlavi",
    year: "2026",
    excerpt: "Exile, foreign rooms, and the second life of a family archive.",
    body: `Some photographs never left Iran. Others crossed borders in newspapers, museums, and private hands.\n\nAfter 1979 the story continues in airports, foreign residences, and the long work of speaking about home from elsewhere. Exile is not only departure. It is how a family remains legible when the palace is closed.`,
    tags: ["Exile"],
  },
  {
    id: "l-06",
    kind: "book",
    title: "How a caption works",
    author: "mypahlavi",
    year: "2026",
    excerpt: "Year, place, person — the minimum honest sentence under an image.",
    body: `A good caption does four things: names the person, places the year, allows uncertainty when the record is incomplete, and refuses gossip dressed as history.\n\nThis digital collection inherits that standard from print journalism and museum practice — without the velvet rope.`,
    tags: ["Editorial"],
  },
];

export const patronageTiers = [
  {
    id: "reader",
    name: "Patron",
    price: "£12 / month",
    description: "Quiet support for digitisation and new essays.",
    perks: [
      "Circle newsletter",
      "Early library notes",
      "Name on the supporters list",
    ],
  },
  {
    id: "patron",
    name: "Collector",
    price: "£36 / month",
    description: "Sustaining membership for the working archive.",
    perks: [
      "Everything in Patron",
      "Early Vault releases",
      "Higher-resolution gallery access",
      "Seasonal digital folio",
    ],
  },
  {
    id: "benefactor",
    name: "Founding Circle",
    price: "£120 / month",
    description: "Major support for conservation-scale work and Editions.",
    perks: [
      "Everything in Collector",
      "Collector previews of Editions",
      "Private archival releases",
      "Annual physical publication (when issued)",
    ],
  },
];

export const rooms = [
  { id: "selection", label: "Selection" },
  { id: "coronation", label: "Coronation" },
  { id: "family", label: "Family" },
  { id: "early", label: "Early court" },
  { id: "exile", label: "Exile" },
  { id: "state", label: "State" },
  { id: "all", label: "Full archive" },
];

export function getMember(id: string) {
  return familyMembers.find((m) => m.id === id);
}

export function imagesForMember(id: string) {
  return galleryImages.filter((g) => g.personIds.includes(id));
}
