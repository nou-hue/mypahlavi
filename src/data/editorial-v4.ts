export type EditorialSource = {
  label: string;
  institution: string;
  url: string;
  note: string;
};

export type EditorialStory = {
  id: string;
  kicker: string;
  title: string;
  standfirst: string;
  period: string;
  readTime: string;
  imageSrc: string;
  imageAlt: string;
  imageMeta: string;
  paragraphs: string[];
  sourceIds: string[];
  format: "Long read" | "The Photograph" | "The Building" | "Archive investigation";
};

export const editorialSources: Record<string, EditorialSource> = {
  harvardOralHistory: {
    label: "Iranian Oral History Project",
    institution: "Harvard Library",
    url: "https://library.harvard.edu/collections/iranian-oral-history-project",
    note: "Personal accounts from 134 political participants and eyewitnesses; 118 narratives are digitised.",
  },
  iranicaArchitectureEarly: {
    label: "Architecture vii. Pahlavi, before World War II",
    institution: "Encyclopaedia Iranica",
    url: "https://www.iranicaonline.org/articles/architecture-vii/",
    note: "Reference account of state building, road building and urban transformation under Reza Shah.",
  },
  iranicaArchitectureLate: {
    label: "Architecture viii. Pahlavi, after World War II",
    institution: "Encyclopaedia Iranica",
    url: "https://www.iranicaonline.org/articles/architecture-viii/",
    note: "Reference account of post-war urbanisation, architecture and the consequences of rapid growth.",
  },
  frusIran: {
    label: "Foreign Relations of the United States: Iran, 1951–1954",
    institution: "U.S. Department of State, Office of the Historian",
    url: "https://history.state.gov/historicaldocuments/frus1951-54IranEd2",
    note: "Declassified U.S. diplomatic and intelligence record. A primary source representing the perspective of the U.S. government.",
  },
};

export const editorialStories: EditorialStory[] = [
  {
    id: "tehran-remade",
    kicker: "ISSUE 01 / THE CITY",
    title: "Tehran, remade",
    standfirst:
      "Modern Tehran was not built in a single moment. Roads, apartments, ministries, villas and new planning ideas accumulated across decades — producing both a powerful image of modernisation and serious urban contradictions.",
    period: "1930s–1970s",
    readTime: "8 min",
    imageSrc: "/archive/other-family/user-before-the-map-of-iran.jpg",
    imageAlt: "An archival scene connected to twentieth-century Iran and state planning.",
    imageMeta: "IRAN · MID-CENTURY ARCHIVE",
    format: "Long read",
    sourceIds: ["iranicaArchitectureEarly", "iranicaArchitectureLate", "harvardOralHistory"],
    paragraphs: [
      "The transformation of Tehran began before the post-war oil boom. Under Reza Shah, new avenues cut through older urban fabric, ministries and public buildings adopted new architectural languages, and the capital was increasingly organised around the needs of a modern state.",
      "After 1945, the city changed again. Apartment blocks, suburban villas, motor traffic and master-planning arrived at a different scale. Modernisation brought new institutions and infrastructure, while fast growth also intensified land speculation, environmental pressure and the distance between planning ideals and everyday life.",
      "MyPahlavi treats that tension as part of the history rather than an inconvenience to remove. The archive will place photographs beside planning history, oral recollections and contemporary records so that the visual promise of the city can be read alongside its costs.",
    ],
  },
  {
    id: "how-memory-survives",
    kicker: "ORAL HISTORY",
    title: "How memory survives a political rupture",
    standfirst:
      "A photograph records a surface. Oral history records recollection — partial, personal, sometimes contradictory. Read together, they make the archive more honest.",
    period: "1920s–1980s recollected",
    readTime: "6 min",
    imageSrc: "/archive/other-family/user-garden-laughter-with-baby.jpg",
    imageAlt: "A family photograph from the Pahlavi-era archive.",
    imageMeta: "PRIVATE IMAGE · DATE TO VERIFY",
    format: "Archive investigation",
    sourceIds: ["harvardOralHistory"],
    paragraphs: [
      "Harvard's Iranian Oral History Project preserves accounts from people who occupied very different positions in twentieth-century Iranian political life. The value of the collection is not that every recollection agrees; it is that disagreement itself becomes evidence.",
      "For MyPahlavi, oral testimony will never be used as a decorative quotation. Each recollection will be identified by speaker, interview date and context, then compared with documentary and scholarly sources where possible.",
    ],
  },
  {
    id: "documents-and-power",
    kicker: "PRIMARY SOURCES",
    title: "Reading documents written inside power",
    standfirst:
      "Declassified diplomatic files can illuminate decisions and assumptions — but they are not a neutral narrator of Iranian history.",
    period: "1951–1954",
    readTime: "7 min",
    imageSrc: "/archive/reza-shah/reza-shah-woolf-portrait-1938.jpg",
    imageAlt: "Archival portrait from the Pahlavi-era collection.",
    imageMeta: "ARCHIVE PLATE · CONTEXTUAL IMAGE",
    format: "Archive investigation",
    sourceIds: ["frusIran", "harvardOralHistory"],
    paragraphs: [
      "The U.S. Foreign Relations series contains hundreds of documents on Iran's early-1950s political crisis, including material on the planning and implementation of Operation TPAJAX. These records are unusually valuable because they expose contemporary government reasoning in its own language.",
      "They also require careful handling. A diplomatic memorandum tells us what its authors believed, wanted or reported; it does not automatically tell us the whole truth of an event. MyPahlavi will therefore label institutional perspective explicitly and avoid converting a single archive into an omniscient voice.",
    ],
  },
];

export function sourcesForStory(story: EditorialStory) {
  return story.sourceIds.map((id) => editorialSources[id]).filter(Boolean);
}
