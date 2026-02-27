export interface GenreNode {
    id: string;
    name: string;
    bpm_range?: string;
    children?: GenreNode[];
}

export const GENRE_TAXONOMY: GenreNode[] = [
    {
        id: "house",
        name: "HOUSE",
        children: [
            { id: "deep-house", name: "Deep House" },
            { id: "tech-house", name: "Tech House" },
            { id: "minimal-house", name: "Minimal House" },
            { id: "acid-house", name: "Acid House" },
            { id: "progressive-house", name: "Progressive House" },
            { id: "afro-house", name: "Afro House" },
            { id: "bass-house", name: "Bass House" },
            { id: "indie-dance", name: "Indie Dance" },
            { id: "funky-house", name: "Funky House" },
            { id: "tribal-house", name: "Tribal House" }
        ]
    },
    {
        id: "techno",
        name: "TECHNO",
        children: [
            { id: "melodic-techno", name: "Melodic Techno" },
            { id: "peak-time-techno", name: "Peak Time Techno" },
            { id: "industrial-techno", name: "Industrial Techno" },
            { id: "minimal-techno", name: "Minimal Techno" },
            { id: "acid-techno", name: "Acid Techno" },
            { id: "hard-techno", name: "Hard Techno" },
            { id: "dub-techno", name: "Dub Techno" },
            { id: "experimental-techno", name: "Experimental Techno" },
            { id: "hypnotic-techno", name: "Hypnotic Techno" }
        ]
    },
    {
        id: "psytrance",
        name: "PSYTRANCE",
        children: [
            { id: "progressive-psy", name: "Progressive Psy" },
            { id: "darkpsy", name: "Dark Psy" },
            { id: "prog-dark", name: "Prog Dark" },
            { id: "forest", name: "Forest" },
            { id: "full-on", name: "Full On" },
            { id: "hi-tech", name: "Hi-Tech" },
            { id: "psytechno", name: "Psytechno" },
            { id: "twilight", name: "Twilight" },
            { id: "experimental-psy", name: "Experimental Psy" },
            { id: "zenonesque", name: "Zenonesque" }
        ]
    },
    {
        id: "low-bpm",
        name: "LOW BPM",
        children: [
            { id: "downtempo", name: "Downtempo" },
            { id: "organic-house", name: "Organic House" },
            { id: "ambient", name: "Ambient" },
            { id: "chillout", name: "Chillout" },
            { id: "electronica", name: "Electronica" },
            { id: "deep-progressive", name: "Deep Progressive" }
        ]
    },
    {
        id: "high-bpm",
        name: "HIGH BPM",
        children: [
            { id: "hardcore", name: "Hardcore" },
            { id: "hardtek", name: "Hardtek" },
            { id: "speedcore", name: "Speedcore" },
            { id: "schranz", name: "Schranz" },
            { id: "gabber", name: "Gabber" },
            { id: "hardstyle", name: "Hardstyle" }
        ]
    }
];
