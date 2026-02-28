export type MainGenre = "house" | "techno" | "psytrance" | "high-bpm";

export interface GenreOption {
    id: string;
    name: string;
}

export const MAIN_GENRES: Record<MainGenre, string> = {
    house: "HOUSE",
    techno: "TECHNO",
    psytrance: "PSYTRANCE",
    "high-bpm": "HIGH BPM",
};

// Layer 2 - Strict relationships to Layer 1
export const SUBGENRES: Record<MainGenre, GenreOption[]> = {
    house: [
        { id: "tech-house", name: "Tech House" },
        { id: "minimal-deep-tech", name: "Minimal Deep Tech" },
        { id: "indie-dance", name: "Indie Dance" },
        { id: "acid-house", name: "Acid House" },
        { id: "bass-house", name: "Bass House" },
        { id: "garage-house", name: "Garage House" },
        { id: "uk-garage", name: "UK Garage" },
        { id: "progressive-house", name: "Progressive House" },
        { id: "afro-house", name: "Afro House" },
        { id: "deep-house", name: "Deep House" },
        { id: "tribal-house", name: "Tribal House" }
    ],
    techno: [
        { id: "peak-time", name: "Peak Time" },
        { id: "hypnotic", name: "Hypnotic" },
        { id: "industrial", name: "Industrial" },
        { id: "melodic-techno", name: "Melodic Techno" },
        { id: "psytechno", name: "Psytechno" },
        { id: "acid-techno", name: "Acid Techno" },
        { id: "hard-techno", name: "Hard Techno" },
        { id: "minimal-techno", name: "Minimal Techno" },
        { id: "tribal-techno", name: "Tribal Techno" }
    ],
    psytrance: [
        { id: "full-on", name: "Full On" },
        { id: "progressive-psy", name: "Progressive Psy" },
        { id: "prog-dark", name: "Prog Dark" },
        { id: "off-beat", name: "Off Beat" },
        { id: "goa-trance", name: "Goa Trance" },
        { id: "trance-raw-deep", name: "Trance/Raw/Deep Hypnotic" },
        { id: "tribal-psy", name: "Tribal Psy" }
    ],
    "high-bpm": [
        { id: "hi-tech", name: "Hi-Tech" },
        { id: "forest", name: "Forest" },
        { id: "dark-psy", name: "Dark Psy" },
        { id: "dnb", name: "Drum N Bass" },
        { id: "jungle", name: "Jungle" }
    ]
};

// Layer 3 - Cross-cutting constraints
export const BPM_TIERS: GenreOption[] = [
    { id: "low-bpm", name: "LOW BPM (110-124)" },
    { id: "mid-bpm", name: "MID BPM (125-138)" },
    { id: "high-bpm", name: "HIGH BPM (139-160)" },
    { id: "extreme-bpm", name: "EXTREME (160+)" }
];
