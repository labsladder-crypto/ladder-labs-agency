/**
 * Ladder Labs Event Radar — Firebase Real-time + CEP Geocoding
 * Events stored in Firebase Realtime Database → visible to ALL visitors.
 * CEP/Address field auto-geocodes → pin appears automatically on map.
 * Map focused on Brazil.
 */

import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Calendar, Instagram, Plus, Trash2, Save, X, List, ExternalLink, ArrowRight, Search, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { allArtists } from "../App";
import { supabase } from "../lib/supabase";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ManualEvent {
    id: string;
    name: string;
    promoter: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    date: string;
    instagram: string;
    genres: string[];
    lineup: string[];
    notes: string;
}

const BRAZIL_STATES = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
    "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const ALL_GENRES = [
    "Acid House", "House", "Tech House", "Indie Dance", "UK Garage",
    "Minimal", "Techno", "Peak Time", "Melodic Techno",
    "Psytrance", "Progressive", "Full On", "Dark Psy", "Forest",
    "Hi-Tech", "Trance / Raw", "Deep Trance", "Hypnotic",
];

// Brazil bounds
const BRAZIL_CENTER: [number, number] = [-14.235, -51.925];
const BRAZIL_ZOOM = 4;
const BRAZIL_BOUNDS: [[number, number], [number, number]] = [
    [-35.0, -75.0], // SW
    [6.0, -28.0],   // NE
];

// ─── Map click handler ──────────────────────────────────────────────────────
function MapClickHandler({ active, onMapClick }: { active: boolean; onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (active) onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ─── FlyTo helper ───────────────────────────────────────────────────────────
function FlyToMarker({ lat, lng }: { lat: number | null; lng: number | null }) {
    const map = useMap();
    useEffect(() => {
        if (lat !== null && lng !== null) {
            map.flyTo([lat, lng], 10, { duration: 1.2 });
        }
    }, [lat, lng, map]);
    return null;
}

// ─── CEP / Address Geocoding ────────────────────────────────────────────────
async function geocodeCEP(cep: string): Promise<{ lat: number; lng: number; city: string; state: string } | null> {
    try {
        const clean = cep.replace(/\D/g, "");
        if (clean.length !== 8) return null;
        const viaRes = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const viaData = await viaRes.json();
        if (viaData.erro) return null;
        const city = viaData.localidade || "";
        const state = viaData.uf || "SP";
        // Geocode with Nominatim
        const query = encodeURIComponent(`${viaData.logradouro || ""}, ${city}, ${state}, Brasil`);
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`, {
            headers: { "Accept-Language": "pt-BR" }
        });
        const nomData = await nomRes.json();
        if (nomData.length === 0) {
            // Fallback: geocode just city
            const cityQuery = encodeURIComponent(`${city}, ${state}, Brasil`);
            const cityRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${cityQuery}&format=json&limit=1&countrycodes=br`);
            const cityData = await cityRes.json();
            if (cityData.length === 0) return null;
            return { lat: parseFloat(cityData[0].lat), lng: parseFloat(cityData[0].lon), city, state };
        }
        return { lat: parseFloat(nomData[0].lat), lng: parseFloat(nomData[0].lon), city, state };
    } catch {
        return null;
    }
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const query = encodeURIComponent(`${address}, Brasil`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`, {
            headers: { "Accept-Language": "pt-BR" }
        });
        const data = await res.json();
        if (data.length === 0) return null;
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {
        return null;
    }
}

// ─── Empty form state ─────────────────────────────────────────────────────
const EMPTY_FORM = {
    name: "",
    promoter: "",
    address: "",
    city: "",
    state: "SP",
    date: "",
    instagram: "",
    genres: [] as string[],
    lineup: [] as string[],
    notes: "",
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EventRadar({
    t,
    isAuthorized = false,
    onGateRequest
}: {
    t: any;
    isAuthorized?: boolean;
    onGateRequest?: () => void;
}) {
    const [events, setEvents] = useState<ManualEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [view, setView] = useState<"list" | "form" | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<ManualEvent | null>(null);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);
    const [flyTo, setFlyTo] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

    // Supabase real-time listener
    useEffect(() => {
        setIsLoaded(true);

        // Initial load
        supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setEvents(data as ManualEvent[]);
                setFirebaseReady(true);
            });

        // Real-time subscription — INSERT / DELETE
        const channel = supabase
            .channel("events-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (payload) => {
                setEvents((prev) => {
                    if (prev.find((e) => e.id === payload.new.id)) return prev;
                    return [...prev, payload.new as ManualEvent];
                });
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "events" }, (payload) => {
                setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);


    const handleMapClick = useCallback((lat: number, lng: number) => {
        setPending({ lat, lng });
        setForm(EMPTY_FORM);
        setView("form");
        setAddMode(false);
        setGeocodeError(null);
    }, []);

    // ─── Geocoding handler ─────────────────────────────────────────────────
    const handleGeocode = async () => {
        const addr = form.address.trim();
        if (!addr) return;
        setGeocoding(true);
        setGeocodeError(null);

        let result: { lat: number; lng: number; city?: string; state?: string } | null = null;

        // Try CEP first (8 digits)
        if (/^\d{5}-?\d{3}$/.test(addr)) {
            result = await geocodeCEP(addr);
        } else {
            result = await geocodeAddress(addr);
        }

        setGeocoding(false);

        if (!result) {
            setGeocodeError("Endereço não encontrado. Tente um CEP ou nome de cidade.");
            return;
        }

        setPending({ lat: result.lat, lng: result.lng });
        setFlyTo({ lat: result.lat, lng: result.lng });

        const updates: Partial<typeof form> = {};
        if (result.city && !form.city) updates.city = result.city;
        if (result.state && !form.state) updates.state = result.state as string;

        if (Object.keys(updates).length > 0) {
            setForm(f => ({ ...f, ...updates }));
        }

        setView("form");
    };

    const handleSave = async () => {
        if (!pending || !form.name.trim() || !form.city.trim()) return;
        const newEvent = {
            name: form.name,
            promoter: form.promoter,
            city: form.city,
            state: form.state,
            lat: pending.lat,
            lng: pending.lng,
            date: form.date || null,
            instagram: form.instagram,
            genres: form.genres,
            lineup: form.lineup,
            notes: form.notes,
        };

        const { error } = await supabase.from("events").insert([newEvent]);
        if (error) {
            console.error("Supabase insert error:", error.message);
            // Fallback to local state if DB not ready
            const localEvent: ManualEvent = { id: `evt-${Date.now()}`, ...newEvent };
            setEvents((prev) => [...prev, localEvent]);
        }

        setPending(null);
        setForm(EMPTY_FORM);
        setFlyTo({ lat: null, lng: null });
        setView("list");
        setGeocodeError(null);
    };

    const handleCancel = () => {
        setPending(null);
        setForm(EMPTY_FORM);
        setFlyTo({ lat: null, lng: null });
        setGeocodeError(null);
        setView(events.length > 0 ? "list" : null);
        setAddMode(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) {
            console.error("Supabase delete error:", error.message);
            // Fallback: remove locally
            setEvents((prev) => prev.filter((e) => e.id !== id));
        }
        setDeleteConfirm(null);
        if (selectedEvent?.id === id) setSelectedEvent(null);
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ladder-events.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <section id="radar" className="py-24 md:py-32 relative">
            <div className="container mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="text-brand-cyan/40 text-[10px]">✦</span>
                        <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-[0.5em]">
                            {t.tag}
                        </span>
                        <span className="text-brand-cyan/40 text-[10px]">✦</span>
                    </div>
                    <h2 className="font-display font-bold tracking-tighter mb-4">
                        LADDER LABS <span className="text-gradient">{t.title}</span>
                    </h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">
                        {events.length > 0
                            ? t.mappedEvents(events.length)
                            : t.emptyState}
                    </p>
                </motion.div>

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-6 flex-wrap"
                >
                    {/* Add Mode toggle */}
                    <button
                        onClick={() => {
                            if (!isAuthorized && !addMode) {
                                onGateRequest?.();
                                return;
                            }
                            setAddMode(!addMode);
                            if (!addMode) {
                                setView("form");
                                setPending(null);
                                setForm(EMPTY_FORM);
                                setGeocodeError(null);
                            } else {
                                handleCancel();
                            }
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${addMode
                            ? "bg-brand-cyan text-brand-dark border-brand-cyan"
                            : "border-brand-cyan/30 text-brand-cyan hover:border-brand-cyan"
                            }`}
                    >
                        {addMode ? <X size={12} /> : <Plus size={12} />}
                        {addMode ? t.cancel : t.add}
                    </button>

                    {/* List toggle */}
                    {events.length > 0 && (
                        <button
                            onClick={() => setView(view === "list" ? null : "list")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${view === "list"
                                ? "bg-white/10 border-white/20 text-white"
                                : "border-white/10 text-white/50 hover:border-white/30"
                                }`}
                        >
                            <List size={12} />
                            {t.viewList(events.length)}
                        </button>
                    )}

                    {/* Firebase live indicator */}
                    {firebaseReady && (
                        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-green-400/70">Ao vivo</span>
                        </div>
                    )}

                    {/* Export */}
                    {events.length > 0 && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50 transition-all"
                        >
                            ↓ Exportar JSON
                        </button>
                    )}
                </motion.div>

                {/* Map + Panel Layout */}
                <div className={`grid gap-6 ${view ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className={`relative rounded-3xl overflow-hidden border border-white/[0.08] radar-map-wrapper ${addMode ? "cursor-crosshair" : ""}`}
                        style={{ height: "520px" }}
                    >
                        {isLoaded && (
                            <MapContainer
                                center={BRAZIL_CENTER}
                                zoom={BRAZIL_ZOOM}
                                minZoom={3}
                                maxZoom={16}
                                maxBounds={BRAZIL_BOUNDS}
                                maxBoundsViscosity={0.8}
                                style={{ height: "100%", width: "100%", background: "#0B0B0F" }}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    subdomains="abcd"
                                    maxZoom={19}
                                />

                                <MapClickHandler active={addMode} onMapClick={handleMapClick} />
                                <FlyToMarker lat={flyTo.lat} lng={flyTo.lng} />

                                {/* Pending (unconfirmed) marker */}
                                {pending && (
                                    <>
                                        <CircleMarker
                                            center={[pending.lat, pending.lng]}
                                            radius={10}
                                            pathOptions={{
                                                fillColor: "#00F2FF",
                                                fillOpacity: 0.6,
                                                color: "#00F2FF",
                                                weight: 2,
                                                dashArray: "4 4",
                                            }}
                                        />
                                        <Marker
                                            position={[pending.lat, pending.lng]}
                                            icon={L.divIcon({
                                                className: "",
                                                iconAnchor: [80, 36],
                                                iconSize: [160, 28],
                                                html: `<div style="
                                                    background: rgba(0,242,255,0.08);
                                                    border: 1px solid rgba(0,242,255,0.25);
                                                    border-radius: 6px;
                                                    padding: 4px 12px;
                                                    font-family: 'Space Grotesk', sans-serif;
                                                    font-size: 11px;
                                                    font-weight: 800;
                                                    font-style: italic;
                                                    text-transform: uppercase;
                                                    letter-spacing: 0.08em;
                                                    color: rgba(0,242,255,0.6);
                                                    white-space: nowrap;
                                                    text-align: center;
                                                    backdrop-filter: blur(4px);
                                                    pointer-events: none;
                                                ">Novo evento…</div>`,
                                            })}
                                            interactive={false}
                                        />
                                    </>
                                )}

                                {/* Saved events */}
                                {events.map((event) => {
                                    const artistCount = event.lineup ? event.lineup.length : 0;
                                    let densityColor = "#00F2FF";
                                    if (artistCount >= 3 && artistCount <= 5) densityColor = "#F59E0B";
                                    if (artistCount > 5) densityColor = "#FF2D7A";

                                    const lineupArtists = event.lineup ? event.lineup.map(name => allArtists.find(a => a.name === name)).filter(Boolean) : [];
                                    const displayAvatars = lineupArtists.slice(0, 4);
                                    const extraCount = lineupArtists.length > 4 ? lineupArtists.length - 4 : 0;

                                    return (
                                        <div key={`event-${event.id}`}>
                                            <CircleMarker
                                                center={[event.lat, event.lng]}
                                                radius={10}
                                                eventHandlers={{ click: () => setSelectedEvent(event) }}
                                                pathOptions={{
                                                    fillColor: densityColor,
                                                    fillOpacity: 0.9,
                                                    color: "#0B0B0F",
                                                    weight: 2,
                                                }}
                                            >
                                                <Popup className="radar-popup">
                                                    <div className="radar-popup-content min-w-[160px]">
                                                        <div className="radar-popup-title" onClick={() => setSelectedEvent(event)} style={{ cursor: "pointer", display: "inline-block", position: "relative" }}>
                                                            {event.name}
                                                            <span style={{ position: "absolute", bottom: "-4px", left: 0, height: "1px", width: "100%", background: "currentColor", opacity: 0.3 }} />
                                                        </div>
                                                        {event.promoter && (
                                                            <div className="radar-popup-row" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "10px" }}>
                                                                {event.promoter}
                                                            </div>
                                                        )}
                                                        <div className="radar-popup-row">
                                                            <MapPin size={10} />
                                                            {event.city}, {event.state}
                                                        </div>
                                                        {event.date && (
                                                            <div className="radar-popup-row">
                                                                <Calendar size={10} />
                                                                {new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}
                                                            </div>
                                                        )}
                                                        {lineupArtists.length > 0 && (
                                                            <div className="flex -space-x-2 my-2 py-1 items-center" onClick={() => setSelectedEvent(event)}>
                                                                {displayAvatars.map((artist, idx) => (
                                                                    <div key={idx} className="relative group/avatar">
                                                                        <img
                                                                            src={artist?.image}
                                                                            alt={artist?.name}
                                                                            className="w-7 h-7 rounded-full border border-black object-cover relative z-10 hover:z-20 hover:scale-110 transition-transform cursor-pointer"
                                                                            title={artist?.name}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {extraCount > 0 && (
                                                                    <div className="w-7 h-7 rounded-full bg-[#1A1A24] border border-black flex items-center justify-center text-[8px] font-bold text-white relative z-10">
                                                                        +{extraCount}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="radar-popup-row mt-2" style={{ cursor: "pointer", color: "#00F2FF", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }} onClick={() => setSelectedEvent(event)}>
                                                            <ArrowRight size={10} /> See Details
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </CircleMarker>

                                            <Marker
                                                position={[event.lat, event.lng]}
                                                eventHandlers={{ click: () => setSelectedEvent(event) }}
                                                icon={L.divIcon({
                                                    className: "",
                                                    iconAnchor: [110, 38],
                                                    iconSize: [220, 30],
                                                    html: `<div style="
                                                        background: rgba(11,11,15,0.82);
                                                        border: 1px solid ${densityColor}59;
                                                        border-radius: 6px;
                                                        padding: 5px 14px;
                                                        font-family: 'Space Grotesk', sans-serif;
                                                        font-size: 12px;
                                                        font-weight: 900;
                                                        text-transform: uppercase;
                                                        letter-spacing: 0.07em;
                                                        color: white;
                                                        white-space: nowrap;
                                                        text-align: center;
                                                        backdrop-filter: blur(8px);
                                                        box-shadow: 0 2px 16px ${densityColor}40;
                                                        pointer-events: auto;
                                                        cursor: pointer;
                                                    " onclick="document.dispatchEvent(new CustomEvent('mapLabelClick', { detail: '${event.id}' }))">${event.name}</div>`,
                                                })}
                                                interactive={true}
                                            />
                                        </div>
                                    );
                                })}
                            </MapContainer>
                        )}

                        {/* Attribution */}
                        <div className="absolute bottom-1 right-2 z-[1000] pointer-events-none">
                            <span className="text-[7px] text-white/10">© OpenStreetMap © CARTO</span>
                        </div>

                        {/* Empty state overlay */}
                        {events.length === 0 && !addMode && (
                            <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
                                <div className="text-center">
                                    <div className="text-[40px] mb-3 opacity-20">📍</div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                                        {t.emptyState}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Event Detail Modal */}
                        <AnimatePresence>
                            {selectedEvent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-4 left-4 right-4 md:left-auto md:w-80 bg-[#0B0B0F]/95 backdrop-blur-xl border border-brand-cyan/20 rounded-2xl p-5 z-[2000] shadow-2xl max-h-[80%] overflow-y-auto override-scrollbar"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="pr-4">
                                            <h3 className="text-[13px] font-bold text-white mb-1 uppercase tracking-wider">{selectedEvent.name}</h3>
                                            <p className="text-[10px] text-white/50 flex items-center gap-1 font-mono uppercase tracking-widest">
                                                <MapPin size={9} /> {selectedEvent.city}, {selectedEvent.state}
                                                {selectedEvent.date && ` · ${new Date(selectedEvent.date + "T00:00:00").toLocaleDateString("pt-BR").slice(0, 5)}`}
                                            </p>
                                        </div>
                                        <button onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full shrink-0">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedEvent.lineup && selectedEvent.lineup.length > 0 && (
                                            <div>
                                                <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-cyan mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                                                    Lineup Confirmado
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedEvent.lineup.map(artistName => {
                                                        const artist = allArtists.find(a => a.name === artistName);
                                                        if (!artist) return null;
                                                        return (
                                                            <div key={artistName} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col items-center text-center group hover:bg-white/[0.06] transition-colors">
                                                                <img
                                                                    src={artist.image}
                                                                    alt={artist.name}
                                                                    className="w-12 h-12 rounded-full object-cover mb-2 border border-white/10 group-hover:border-brand-cyan transition-colors"
                                                                />
                                                                <span className="text-[10px] font-bold text-white truncate w-full uppercase tracking-wider">{artist.name}</span>
                                                                <span className="text-[8px] text-white/30 truncate w-full uppercase tracking-widest">{artist.genre.split('/')[0]}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedEvent(null);
                                                                        document.dispatchEvent(new CustomEvent('bookArtist', { detail: { artistName: artist.name } }));
                                                                        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                                                                    }}
                                                                    className="mt-3 w-full py-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan text-[8px] font-bold uppercase tracking-widest hover:bg-brand-cyan hover:text-brand-dark transition-colors"
                                                                >
                                                                    Book
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {selectedEvent.notes && (
                                            <div className="text-[10px] text-white/50 bg-white/5 p-3 rounded-xl italic leading-relaxed">
                                                "{selectedEvent.notes}"
                                            </div>
                                        )}

                                        {selectedEvent.instagram && (
                                            <a href={selectedEvent.instagram.startsWith("http") ? selectedEvent.instagram : `https://instagram.com/${selectedEvent.instagram.replace("@", "")}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/5 transition-colors">
                                                <Instagram size={12} />
                                                Ver no Instagram
                                                <ExternalLink size={10} className="opacity-50" />
                                            </a>
                                        )}

                                        {/* Delete button (authorized only) */}
                                        {isAuthorized && (
                                            <button
                                                onClick={() => setDeleteConfirm(selectedEvent.id)}
                                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-red-500/20 text-[9px] font-bold uppercase tracking-widest text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={10} />
                                                {t.deleteEvent}
                                            </button>
                                        )}

                                        <AnimatePresence>
                                            {deleteConfirm === selectedEvent.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-center"
                                                >
                                                    <p className="text-white/70 mb-2">
                                                        {t.deleteConfirm1} <strong>{selectedEvent.name}</strong>? {t.deleteConfirm2}
                                                    </p>
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">{t.cancelDelete}</button>
                                                        <button onClick={() => handleDelete(selectedEvent.id)} className="px-3 py-1.5 rounded-md bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">{t.confirmDelete}</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Side Panel */}
                    <AnimatePresence>
                        {view && (
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col gap-4"
                            >

                                {/* ── ADD / EDIT FORM ── */}
                                {view === "form" && (
                                    <div className="glass-panel rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-cyan">
                                                Novo Evento
                                            </h4>
                                            <button onClick={handleCancel} className="text-white/30 hover:text-white transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Name */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                    {t.eventName} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    placeholder="Ex: Makuna Festival"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
                                                />
                                            </div>

                                            {/* Promoter */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                    {t.orgName}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.promoter}
                                                    onChange={(e) => setForm({ ...form, promoter: e.target.value })}
                                                    placeholder="Ex: Makuna Eventos"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
                                                />
                                            </div>

                                            {/* Address / CEP Geocoding */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                    Endereço ou CEP
                                                    <span className="ml-2 text-brand-cyan/60 normal-case tracking-normal">→ pin no mapa automático</span>
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={form.address}
                                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                        onKeyDown={(e) => { if (e.key === "Enter") handleGeocode(); }}
                                                        placeholder="Ex: 14020-010 ou Ribeirão Preto, SP"
                                                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleGeocode}
                                                        disabled={geocoding || !form.address.trim()}
                                                        className="px-3 py-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan hover:text-brand-dark transition-colors disabled:opacity-30 flex items-center justify-center"
                                                    >
                                                        {geocoding ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                                                    </button>
                                                </div>
                                                {geocodeError && (
                                                    <p className="text-[9px] text-red-400 mt-1">{geocodeError}</p>
                                                )}
                                                {pending && !geocodeError && (
                                                    <p className="text-[9px] text-brand-cyan/60 mt-1 font-mono">
                                                        📍 {pending.lat.toFixed(4)}, {pending.lng.toFixed(4)} — pin colocado!
                                                    </p>
                                                )}
                                                {!pending && (
                                                    <p className="text-[9px] text-white/20 mt-1">
                                                        Ou clique diretamente no mapa para marcar
                                                    </p>
                                                )}
                                            </div>

                                            {/* City + State row */}
                                            <div className="grid grid-cols-[1fr_80px] gap-2">
                                                <div>
                                                    <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                        {t.city} *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.city}
                                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                        placeholder="Ex: Ribeirão Preto"
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                        {t.stateLabel}
                                                    </label>
                                                    <select
                                                        value={form.state}
                                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-white focus:outline-none focus:border-brand-cyan transition-colors"
                                                        style={{ colorScheme: "dark" }}
                                                    >
                                                        {BRAZIL_STATES.map((s) => (
                                                            <option key={s} value={s} className="bg-[#0B0B0F]">{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                    {t.dateLabel}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={form.date}
                                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-brand-cyan transition-colors"
                                                    style={{ colorScheme: "dark" }}
                                                />
                                            </div>

                                            {/* Instagram */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                    {t.instagramLabel}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.instagram}
                                                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                                                    placeholder="@makuna.oficial ou URL completa"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
                                                />
                                            </div>

                                            {/* Genres */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-2 block">
                                                    {t.genresLabel}
                                                    {form.genres.length > 0 && (
                                                        <span className="ml-2 text-brand-cyan">{form.genres.length} selecionada{form.genres.length !== 1 ? "s" : ""}</span>
                                                    )}
                                                </label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {ALL_GENRES.map((g) => {
                                                        const selected = form.genres.includes(g);
                                                        return (
                                                            <button
                                                                key={g}
                                                                type="button"
                                                                onClick={() =>
                                                                    setForm((f) => ({
                                                                        ...f,
                                                                        genres: selected
                                                                            ? f.genres.filter((x) => x !== g)
                                                                            : [...f.genres, g],
                                                                    }))
                                                                }
                                                                className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider transition-all border ${selected
                                                                    ? "bg-brand-pink/20 border-brand-pink text-brand-pink"
                                                                    : "border-white/10 text-white/30 hover:border-white/25 hover:text-white/50"
                                                                    }`}
                                                            >
                                                                {g}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Lineup */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-2 block">
                                                    Artistas do Lineup
                                                    {form.lineup.length > 0 && (
                                                        <span className="ml-2 text-brand-cyan">{form.lineup.length} selecionado{form.lineup.length !== 1 ? "s" : ""}</span>
                                                    )}
                                                </label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {form.lineup.map((artistName) => {
                                                        const artist = allArtists.find(a => a.name === artistName);
                                                        return (
                                                            <div key={artistName} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1 pr-3 py-1">
                                                                {artist?.image ? (
                                                                    <img src={artist.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full bg-brand-cyan/20" />
                                                                )}
                                                                <span className="text-[9px] font-bold text-white">{artistName}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setForm(f => ({ ...f, lineup: f.lineup.filter(name => name !== artistName) }))}
                                                                    className="text-white/30 hover:text-red-400 ml-1 flex items-center justify-center bg-black/50 rounded-full w-3 h-3"
                                                                >
                                                                    <X size={8} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value=""
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val && !form.lineup.includes(val)) {
                                                                setForm(f => ({ ...f, lineup: [...f.lineup, val] }));
                                                            }
                                                        }}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-brand-cyan transition-colors appearance-none cursor-pointer"
                                                        style={{ colorScheme: "dark" }}
                                                    >
                                                        <option value="" disabled className="text-white/30">Selecione um artista...</option>
                                                        {allArtists.filter(a => !form.lineup.includes(a.name)).map(a => (
                                                            <option key={a.name} value={a.name} className="bg-[#0B0B0F]">{a.name} — {a.genre}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                                        <Plus size={12} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 block">
                                                    {t.notesLabel}
                                                </label>
                                                <textarea
                                                    value={form.notes}
                                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                                    placeholder="Capacidade, observações..."
                                                    rows={2}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-colors resize-none"
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={!form.name.trim() || !form.city.trim() || !pending}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-brand-cyan text-brand-dark py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                                                >
                                                    <Save size={12} />
                                                    {!pending ? "Marque o endereço primeiro" : t.saveBtn}
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-4 py-2.5 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
                                                >
                                                    {t.cancel}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── EVENT LIST ── */}
                                {view === "list" && (
                                    <div className="glass-panel rounded-2xl p-6 max-h-[520px] overflow-y-auto">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-brand-pink">
                                                Eventos ({events.length})
                                            </h4>
                                            <button onClick={() => setView(null)} className="text-white/30 hover:text-white transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>

                                        {events.length === 0 ? (
                                            <p className="text-[9px] text-white/20 text-center py-8">Nenhum evento ainda.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {events.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="rounded-xl border border-white/[0.06] p-3 hover:border-white/10 transition-colors cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedEvent(event);
                                                            setFlyTo({ lat: event.lat, lng: event.lng });
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-bold text-white truncate">{event.name}</p>
                                                                <p className="text-[8px] text-white/40 mt-0.5">
                                                                    {event.city}, {event.state}
                                                                    {event.date ? ` · ${new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}
                                                                </p>
                                                            </div>
                                                            {isAuthorized && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(event.id); }}
                                                                    className="text-white/20 hover:text-red-400 transition-colors ml-2 shrink-0"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <AnimatePresence>
                                                            {deleteConfirm === event.id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="mt-2"
                                                                >
                                                                    <div className="p-3 bg-red-500/10 border-t border-red-500/20 text-[10px] text-center">
                                                                        <p className="text-white/70 mb-2">
                                                                            {t.deleteConfirm1} <strong>{event.name}</strong>? {t.deleteConfirm2}
                                                                        </p>
                                                                        <div className="flex justify-center gap-2">
                                                                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">{t.cancelDelete}</button>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} className="px-3 py-1.5 rounded-md bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">{t.confirmDelete}</button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
