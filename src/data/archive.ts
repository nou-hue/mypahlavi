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
      "Queen consort of Reza Shah and mother of Mohammad Reza Shah. A central figure of the early court and later years of exile.",
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
      "Second and last reigning Shah of the Pahlavi dynasty (1941–1979). His reign saw land reform, education expansion, and industrial growth — and, finally, revolution and exile.",
    portraitGradient: "from-[#2c2822] via-[#4a4238] to-[#12110f]",
    portraitSrc: portraitMap["mohammad-reza"],
    tags: ["Shah", "1941–1979"],
  },
  {
    id: "fawzia",
    name: "Princess Fawzia",
    title: "Queen of Iran, 1939–1948",
    years: "1921 – 2013",
    generation: 2,
    parentIds: [],
    summary:
      "Princess Fawzia Fuad of Egypt, sister of King Farouk, married Mohammad Reza in 1939. Their daughter is Princess Shahnaz. The marriage ended in 1948.",
    portraitGradient: "from-[#3a342e] via-[#564c44] to-[#1a1614]",
    portraitSrc: portraitMap["fawzia"],
    tags: ["Queen", "1939–1948"],
  },
  {
    id: "soraya",
    name: "Queen Soraya",
    title: "Queen of Iran, 1951–1958",
    years: "1932 – 2001",
    generation: 2,
    parentIds: [],
    summary:
      "Soraya Esfandiary-Bakhtiary married Mohammad Reza Shah in 1951. The marriage ended in 1958. Her public image remains one of the most photographed of the mid-century court.",
    portraitGradient: "from-[#2f2a24] via-[#4e453c] to-[#141210]",
    portraitSrc: portraitMap["soraya"],
    tags: ["Queen", "1951–1958"],
  },
  {
    id: "ashraf",
    name: "Princess Ashraf Pahlavi",
    title: "Twin sister of the Shah",
    years: "1919 – 2016",
    generation: 2,
    parentIds: ["reza-shah", "tadj-ol-molouk"],
    summary:
      "Diplomat and philanthropist. Represented Iran at the United Nations and founded the Foundation for Iranian Studies.",
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
      "Philanthropist and cultural patron; supported the Red Lion and Sun Society and educational projects.",
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
      "Farah Diba married Mohammad Reza Shah in 1959 and was crowned Shahbanu in 1967. A major patron of arts, architecture, and education; mother of Reza, Farahnaz, Ali Reza, and Leila.",
    portraitGradient: "from-[#35302a] via-[#524840] to-[#161412]",
    portraitSrc: portraitMap["farah"],
    tags: ["Shahbanu", "1959–"],
  },
  {
    id: "shahnaz",
    name: "Princess Shahnaz",
    title: "Princess of Iran",
    years: "1940 –",
    generation: 3,
    parentIds: ["mohammad-reza", "fawzia"],
    summary:
      "Only child of Mohammad Reza Shah and Princess Fawzia of Egypt.",
    portraitGradient: "from-[#38322c] via-[#554c42] to-[#181512]",
    tags: ["Princess"],
  },
  {
    id: "reza",
    name: "Reza Pahlavi",
    title: "Crown Prince",
    years: "1960 –",
    generation: 3,
    parentIds: ["mohammad-reza", "farah"],
    summary:
      "Eldest son of Mohammad Reza Shah and Farah Pahlavi. Designated Crown Prince in 1967; lives in exile.",
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
    summary: "Daughter of Mohammad Reza Shah and Farah Pahlavi.",
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
      "Younger son of the Shah and Shahbanu. Studied ancient Iranian languages and history.",
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
    summary: "Youngest daughter of Mohammad Reza Shah and Farah Pahlavi.",
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
    title: "The private frame",
    author: "mypahlavi",
    year: "2026",
    excerpt:
      "What a single photograph of a royal household can still say — if you give it room.",
    body: `A photograph of a court is never only a face. It is fabric, distance, protocol, weather, and the second before someone speaks.

This collection treats images as primary documents. Captions name who is present, when the frame was made, and what the moment was for. The rest is left to the viewer.

Mohammad Reza Shah and Farah Pahlavi appear often together here — coronation light, airport thresholds, northern visits. So do the earlier households: Fawzia of Egypt in 1939, Soraya in the 1950s. Three marriages, three public languages of a single reign.

The aim is precision, not nostalgia.`,
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
    body: `Ceremony tells a room who is meant to be seen, and in what order.

The 1967 coronation remains one of the brightest sequences in this archive: gold as gravity, not costume. Elsewhere the grammar softens — winter light in Finland, handshakes in Washington, arrivals at Mehrabad. Protocol becomes weather.

Read across the decades and a dynasty becomes a sequence of thresholds.`,
    tags: ["Coronation", "State"],
  },
  {
    id: "l-03",
    kind: "essay",
    title: "Three queens",
    author: "mypahlavi",
    year: "2026",
    excerpt:
      "Fawzia, Soraya, Farah — three consorts of Mohammad Reza Shah, each in her own chapter.",
    body: `Mohammad Reza Shah married three times. The public record often collapses those households into a single myth. The photographs do not.

Princess Fawzia Fuad of Egypt married the Crown Prince in 1939. Their daughter is Princess Shahnaz. The marriage ended in 1948.

Soraya Esfandiary-Bakhtiary was queen from 1951 to 1958 — emerald satin, diamond cascade, a mid-century iconography that still circulates online under the wrong name.

Farah Diba married in 1959, was crowned Shahbanu in 1967, and became mother to the four children of the late reign. Her work in culture and patronage is a separate story from either predecessor.

This site keeps them separate: folders, captions, lineage entries. History is a matter of names.`,
    tags: ["Fawzia", "Soraya", "Farah"],
  },
  {
    id: "l-04",
    kind: "letter",
    title: "On looking carefully",
    author: "Archive desk",
    year: "2026",
    excerpt: "A short note to the reader of this collection.",
    body: `A green gown is not a single identity. A tiara is not a single decade.

We publish with the assumption that readers want accuracy — year, place, person — more than atmosphere. If a plate is incomplete, the caption says so. If a plate is strong, it is allowed to stand without decoration.`,
    tags: ["Editorial"],
  },
  {
    id: "l-05",
    kind: "essay",
    title: "After the palace",
    author: "mypahlavi",
    year: "2026",
    excerpt: "Exile, foreign rooms, and the second life of a family archive.",
    body: `Some photographs never left Iran. Others crossed borders in newspapers, museums, and private hands.

After 1979 the story continues in airports, foreign residences, and the long work of speaking about home from elsewhere. Exile is not only departure. It is how a family remains legible when the palace is closed.`,
    tags: ["Exile"],
  },
  {
    id: "l-06",
    kind: "book",
    title: "How a caption works",
    author: "mypahlavi",
    year: "2026",
    excerpt: "Year, place, person — the minimum honest sentence under an image.",
    body: `A good caption does four things: names the person, places the year, allows uncertainty when the record is incomplete, and refuses gossip dressed as history.

This digital collection inherits that standard from print journalism and museum practice — without the velvet rope.`,
    tags: ["Editorial"],
  },
];

export const patronageTiers = [
  {
    id: "reader",
    name: "Reader",
    price: "£8 / month",
    description: "Quiet support for digitization and new essays.",
    perks: ["Patron newsletter", "Early library notes", "Name on supporters list"],
  },
  {
    id: "patron",
    name: "Patron",
    price: "£28 / month",
    description: "Sustaining membership for the working archive.",
    perks: [
      "Everything in Reader",
      "Higher-resolution gallery previews",
      "Seasonal digital folio",
    ],
  },
  {
    id: "benefactor",
    name: "Benefactor",
    price: "£90 / month",
    description: "Major support for conservation-scale work.",
    perks: [
      "Everything in Patron",
      "Curator briefings",
      "Priority access to limited editions",
    ],
  },
];

export const rooms = [
  { id: "all", label: "All" },
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
  { to: "/gallery", label: "Gallery", description: "The photographic collection." },
  { to: "/lineage", label: "Lineage", description: "Interactive family tree." },
  { to: "/library", label: "Library", description: "Essays and letters." },
  { to: "/editions", label: "Editions", description: "Limited prints and apparel." },
  { to: "/patronage", label: "Patronage", description: "Support the archive." },
];
