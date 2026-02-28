export type MainGenre = "house" | "techno" | "psytrance" | "progressive";

export interface GenreOption {
    id: string;
    name: string;
}

export const MAIN_GENRES: Record<MainGenre, string> = {
    house: "HOUSE",
    techno: "TECHNO",
    psytrance: "PSYTRANCE",
    progressive: "PROGRESSIVE",
};

// Layer 2 - Strict relationships to Layer 1
export const SUBGENRES: Record<MainGenre, GenreOption[]> = {
    house: [
        { id: "deep-house", name: "Deep" },
        { id: "tech-house", name: "Tech House" },
        { id: "bass-house", name: "Bass House" },
        { id: "afro-house", name: "Afro House" },
        { id: "jackin", name: "Jackin" },
        { id: "organic-house", name: "Organic" },
        { id: "indie-dance", name: "Indie Dance" },
    ],
    techno: [
        { id: "peak-time", name: "Peak Time" },
        { id: "melodic", name: "Melodic" },
        { id: "raw-techno", name: "Raw" },
        { id: "industrial", name: "Industrial" },
        { id: "minimal", name: "Minimal" },
        { id: "hard-techno", name: "Hard Techno" },
    ],
    psytrance: [
        { id: "progressive-psy", name: "Progressive Psy" },
        { id: "full-on", name: "Full On" },
        { id: "night-psy", name: "Night" },
        { id: "dark-psy", name: "Dark Psy" },
        { id: "forest", name: "Forest" },
        { id: "hi-tech", name: "Hi-Tech" },
        { id: "prog-dark", name: "Prog Dark" },
        { id: "psytech", name: "Psytech" },
    ],
    progressive: [
        { id: "prog-house", name: "Progressive House" },
        { id: "deep-prog", name: "Deep Progressive" },
    ]
};

// Layer 3 - Cross-cutting constraints
export const BPM_TIERS: GenreOption[] = [
    { id: "low-bpm", name: "LOW BPM (110-124)" },
    { id: "mid-bpm", name: "MID BPM (125-138)" },
    { id: "high-bpm", name: "HIGH BPM (139-160)" },
    { id: "extreme-bpm", name: "EXTREME (160+)" }
];
