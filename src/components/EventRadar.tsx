/**
 * Ladder Labs Event Radar — Supabase Real-time + Precise Geocoding
 * Optimized for Mobile (App-like experience) and Desktop (Premium Interface).
 */

import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MapPin, Calendar, Instagram, Plus, Trash2, Save, X, List, ExternalLink, ArrowRight, Search, Loader, Lock, Map as MapIcon, ChevronUp, ChevronDown, User, Filter, Users } from "lucide-react";
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
function FlyToMarker({ lat, lng, zoom = 10 }: { lat: number | null; lng: number | null; zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        if (lat !== null && lng !== null) {
            map.flyTo([lat, lng], zoom, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [lat, lng, zoom, map]);
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
        const query = encodeURIComponent(`${viaData.logradouro || ""}, ${city}, ${state}, Brasil`);
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`, {
            headers: { "Accept-Language": "pt-BR" }
        });
        const nomData = await nomRes.json();
        if (nomData.length === 0) {
            const cityQuery = encodeURIComponent(`${city}, ${state}, Brasil`);
            const cityRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${cityQuery}&format=json&limit=1&countrycodes=br`);
            const cityData = await cityRes.json();
            if (cityData.length === 0) return null;
            return { lat: parseFloat(cityData[0].lat), lng: parseFloat(cityData[0].lon), city, state };
        }
        return { lat: parseFloat(nomData[0].lat), lng: parseFloat(nomData[0].lon), city, state };
    } catch { return null; }
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
    } catch { return null; }
}

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
    isAuthorized: parentAuthorized = false,
    onGateRequest
}: {
    t: any;
    isAuthorized?: boolean;
    onGateRequest?: () => void;
}) {
    const [events, setEvents] = useState<ManualEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(parentAuthorized);
    const [addMode, setAddMode] = useState(false);
    const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [view, setView] = useState<"list" | "form" | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<ManualEvent | null>(null);
    const [artistFilter, setArtistFilter] = useState<string | null>(null);
    const [showArtistSearch, setShowArtistSearch] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeError, setGeocodeError] = useState<string | null>(null);
    const [flyTo, setFlyTo] = useState<{ lat: number | null; lng: number | null; zoom?: number }>({ lat: null, lng: null });
    const [isMobile, setIsMobile] = useState(false);

    // Filtered events for the map
    const filteredEvents = useMemo(() => {
        if (!artistFilter) return events;
        return events.filter(e => e.lineup?.includes(artistFilter));
    }, [events, artistFilter]);

    // Responsive detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Session-based authorization
    useEffect(() => {
        const savedAuth = sessionStorage.getItem("ladder_radar_auth");
        if (savedAuth === "true") setIsAuthorized(true);
    }, []);

    useEffect(() => {
        if (isAuthorized) sessionStorage.setItem("ladder_radar_auth", "true");
    }, [isAuthorized]);

    // Supabase real-time
    useEffect(() => {
        setIsLoaded(true);
        supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) setEvents(data as ManualEvent[]);
            });

        const channel = supabase
            .channel("events-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (payload) => {
                setEvents((prev) => {
                    if (prev.find((e) => e.id === payload.new.id)) return prev;
                    return [...prev, payload.new as ManualEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

    const handleGeocode = async () => {
        const addr = form.address.trim();
        if (!addr) return;
        setGeocoding(true);
        setGeocodeError(null);

        let result: { lat: number; lng: number; city?: string; state?: string } | null = null;
        if (/^\d{5}-?\d{3}$/.test(addr)) {
            result = await geocodeCEP(addr);
        } else {
            result = await geocodeAddress(addr);
        }

        setGeocoding(false);
        if (!result) {
            setGeocodeError("Local não encontrado. Tente um endereço completo ou CEP.");
            return;
        }

        setPending({ lat: result.lat, lng: result.lng });
        setFlyTo({ lat: result.lat, lng: result.lng, zoom: 12 });

        const updates: Partial<typeof form> = {};
        if (result.city && !form.city) updates.city = result.city;
        if (result.state && !form.state) updates.state = result.state as string;

        if (Object.keys(updates).length > 0) setForm(f => ({ ...f, ...updates }));
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
        if (error) console.error("Error:", error.message);

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
        setView(null);
        setAddMode(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) console.error("Error:", error.message);
        if (selectedEvent?.id === id) setSelectedEvent(null);
    };

    return (
        <section id="radar" className="py-24 md:py-32 relative bg-brand-dark overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-cyan/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-pink/20 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 md:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 mb-6">
                        <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                        <span className="text-brand-cyan text-[10px] font-bold uppercase tracking-[0.3em]">{t.tag}</span>
                    </div>
                    <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
                        EVENT <span className="text-gradient">RADAR</span>
                    </h2>
                    <p className="text-white/40 text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium">
                        ✦ {events.length} LADDER EVENTS ACROSS BRAZIL ✦
                    </p>
                </motion.div>

                {/* Main Radar Layout */}
                <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-3xl bg-[#0B0B0F] h-[700px] lg:h-[750px] group">
                    {/* The Map Component */}
                    <div className={`absolute inset-0 transition-all duration-700 ${view || selectedEvent ? "scale-105 blur-sm" : "scale-100 blur-0"}`}>
                        {isLoaded && (
                            <MapContainer
                                center={BRAZIL_CENTER}
                                zoom={BRAZIL_ZOOM}
                                minZoom={3}
                                maxZoom={18}
                                maxBounds={BRAZIL_BOUNDS}
                                maxBoundsViscosity={0.9}
                                style={{ height: "100%", width: "100%", background: "#0B0B0F" }}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    subdomains="abcd"
                                />

                                <MapClickHandler active={addMode} onMapClick={handleMapClick} />
                                <FlyToMarker lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />

                                {pending && (
                                    <CircleMarker center={[pending.lat, pending.lng]} radius={12} pathOptions={{ fillColor: "#00F2FF", fillOpacity: 0.8, color: "white", weight: 2 }} />
                                )}

                                {filteredEvents.map((event) => (
                                    <CircleMarker
                                        key={event.id}
                                        center={[event.lat, event.lng]}
                                        radius={artistFilter ? 12 : 8}
                                        eventHandlers={{ click: () => setSelectedEvent(event) }}
                                        pathOptions={{
                                            fillColor: event.lineup?.length > 3 ? "#FF2D7A" : "#00F2FF",
                                            fillOpacity: 0.9,
                                            color: artistFilter ? "white" : "#0B0B0F",
                                            weight: artistFilter ? 3 : 2,
                                        }}
                                    />
                                ))}
                            </MapContainer>
                        )}
                    </div>

                    {/* Desktop Toolbar (Top Right) */}
                    {!isMobile && (
                        <div className="absolute top-6 right-6 flex flex-col gap-3 z-[1000]">
                            <button
                                onClick={() => {
                                    setArtistFilter(null);
                                    setView(view === "list" ? null : "list");
                                }}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border transition-all ${view === "list" && !artistFilter ? "bg-white text-brand-dark border-white" : "bg-black/60 border-white/10 text-white hover:border-white/30"}`}
                            >
                                <List size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{t.viewList(events.length)}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setView("list");
                                    // Focus on artist list
                                }}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border transition-all ${artistFilter ? "bg-brand-pink text-white border-brand-pink" : "bg-black/60 border-white/10 text-white hover:border-white/30"}`}
                            >
                                <Users size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Artists</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (!isAuthorized) {
                                        onGateRequest?.();
                                        return;
                                    }
                                    setAddMode(true);
                                }}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-cyan text-brand-dark border border-brand-cyan shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:scale-105 transition-all"
                            >
                                <Plus size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Add Event</span>
                            </button>
                        </div>
                    )}

                    {/* Mobile Floating Buttons - THREE BUTTONS VERSION */}
                    {isMobile && !view && !selectedEvent && (
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-[1000] px-4">
                            <button
                                onClick={() => {
                                    setView("list");
                                }}
                                className="flex-1 flex flex-col items-center justify-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 text-white py-4 rounded-3xl"
                            >
                                <Users size={18} className="text-brand-pink" />
                                <span className="text-[8px] font-bold uppercase tracking-widest px-1">Artistas</span>
                            </button>
                            <button
                                onClick={() => {
                                    setView("list");
                                }}
                                className="flex-[0.9] flex flex-col items-center justify-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 text-white py-4 rounded-3xl"
                            >
                                <List size={18} className="text-white/70" />
                                <span className="text-[8px] font-bold uppercase tracking-widest px-1">Eventos</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (!isAuthorized) { onGateRequest?.(); return; }
                                    setAddMode(true);
                                }}
                                className="flex-1 flex flex-col items-center justify-center gap-1 bg-brand-cyan text-brand-dark py-4 rounded-3xl shadow-xl active:scale-95 transition-transform"
                            >
                                <Plus size={18} />
                                <span className="text-[8px] font-bold uppercase tracking-widest px-1">Adicionar</span>
                            </button>
                        </div>
                    )}

                    {/* Overlays (Side Panels / Bottom Sheets) */}
                    <AnimatePresence>
                        {/* LIST PANEL */}
                        {view === "list" && (
                            <motion.div
                                initial={isMobile ? { y: "100%" } : { x: "100%" }}
                                animate={isMobile ? { y: 0 } : { x: 0 }}
                                exit={isMobile ? { y: "100%" } : { x: "100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                                className={`absolute z-[2000] bg-[#0E0E14]/95 backdrop-blur-2xl shadow-3xl flex flex-col ${isMobile ? "inset-x-0 bottom-0 top-[15%] rounded-t-[40px] border-t border-white/10" : "inset-y-0 right-0 w-[420px] border-l border-white/10"}`}
                            >
                                {isMobile && <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" onClick={() => setView(null)} />}
                                <div className="p-8 pb-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Event List</h3>
                                        <button onClick={() => setView(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                            <X size={20} className="text-white/50" />
                                        </button>
                                    </div>

                                    {/* ARTIST FILTER GRID */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                                                <Filter size={10} /> Filter by Artist
                                            </h4>
                                            {artistFilter && (
                                                <button onClick={() => setArtistFilter(null)} className="text-[9px] font-bold text-brand-cyan uppercase">Clear</button>
                                            )}
                                        </div>
                                        <div className="flex gap-3 overflow-x-auto pb-2 override-scrollbar snap-x">
                                            {allArtists.filter(a => events.some(e => e.lineup?.includes(a.name))).map(artist => (
                                                <button
                                                    key={artist.name}
                                                    onClick={() => setArtistFilter(artistFilter === artist.name ? null : artist.name)}
                                                    className={`relative snap-start shrink-0 transition-all ${artistFilter === artist.name ? "ring-2 ring-brand-cyan ring-offset-4 ring-offset-[#0B0B0F] scale-105" : "opacity-40 hover:opacity-100"}`}
                                                >
                                                    <img src={artist.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-dark flex items-center justify-center border border-white/10">
                                                        <span className="text-[8px] font-bold text-white">{events.filter(e => e.lineup?.includes(artist.name)).length}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3 override-scrollbar">
                                    {filteredEvents.length === 0 ? (
                                        <div className="text-center py-20 opacity-20">
                                            <Search size={40} className="mx-auto mb-4" />
                                            <p className="text-xs uppercase font-bold tracking-widest">No matching dates</p>
                                        </div>
                                    ) : (
                                        filteredEvents.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => { setSelectedEvent(event); setFlyTo({ lat: event.lat, lng: event.lng, zoom: 12 }); if (isMobile) setView(null); }}
                                                className="p-5 rounded-3xl bg-white/10 border border-white/10 hover:border-brand-cyan/40 hover:bg-white/[0.12] transition-all cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <h4 className="text-white font-bold text-base uppercase tracking-tight group-hover:text-brand-cyan transition-colors">{event.name}</h4>
                                                            {/* PREVIEW LINEUP - VERY SMALL NAMES NEXT TO EVENT */}
                                                            <div className="flex flex-wrap gap-1">
                                                                {event.lineup?.map(name => (
                                                                    <span key={name} className="text-[7px] font-black px-1.5 py-0.5 rounded bg-brand-pink/20 border border-brand-pink/30 text-brand-pink uppercase tracking-tighter">
                                                                        {name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest flex items-center gap-1">
                                                            <MapPin size={10} /> {event.city}, {event.state} ✦ <Calendar size={10} /> {new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-white/20 group-hover:translate-x-1 group-hover:text-brand-cyan transition-all ml-4" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* DETAIL BOX */}
                        {selectedEvent && (
                            <motion.div
                                initial={isMobile ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
                                animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
                                exit={isMobile ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
                                className={`absolute z-[2500] shadow-4xl flex flex-col ${isMobile
                                    ? "inset-x-0 bottom-0 max-h-[95%] bg-[#0B0B0F] border-t border-brand-cyan/20 rounded-t-[40px] p-8 overflow-hidden"
                                    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] bg-[#0E0E14]/98 rounded-[40px] border border-brand-cyan/30 p-10"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex-1 min-w-0">
                                        <div className="inline-block px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-[9px] font-bold text-brand-cyan uppercase tracking-widest mb-3">Confirmed Date</div>
                                        <h3 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 leading-none">{selectedEvent.name}</h3>
                                        <p className="text-xs md:text-sm text-white/50 flex items-center gap-2 uppercase tracking-widest font-bold">
                                            <MapPin size={14} className="text-brand-cyan" /> {selectedEvent.city}, {selectedEvent.state}
                                            <span className="mx-2 text-white/20">|</span>
                                            <Calendar size={14} className="text-brand-cyan" /> {new Date(selectedEvent.date + "T00:00:00").toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedEvent(null)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group ml-4 shrink-0">
                                        <X size={24} className="text-white/70 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="space-y-8 flex-1 overflow-y-auto override-scrollbar pr-4">
                                    {/* Lineup Section */}
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-5 flex items-center gap-2">
                                            LINEUP <span className="h-[1px] flex-1 bg-white/10" />
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedEvent.lineup?.map(name => {
                                                const artist = allArtists.find(a => a.name === name);
                                                return (
                                                    <div key={name} className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-3xl hover:bg-white/[0.06] transition-all group cursor-pointer" onClick={() => {
                                                        setSelectedEvent(null);
                                                        document.getElementById('artists')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}>
                                                        <img src={artist?.image || "/logos/Ladder-Labs-2.png"} alt={name} className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-brand-cyan transition-all" />
                                                        <div className="flex-1">
                                                            <p className="text-base md:text-lg font-black text-white uppercase leading-none group-hover:text-brand-cyan transition-colors">{name}</p>
                                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{artist?.genre || "Electronic"}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="flex gap-4 pb-4">
                                        {selectedEvent.instagram && (
                                            <a href={selectedEvent.instagram.startsWith("http") ? selectedEvent.instagram : `https://instagram.com/${selectedEvent.instagram.replace("@", "")}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-5 rounded-3xl bg-white text-brand-dark font-black text-[12px] uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all">
                                                <Instagram size={18} /> Instagram
                                            </a>
                                        )}
                                        {isAuthorized && (
                                            <button onClick={() => handleDelete(selectedEvent.id)} className="w-16 flex items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* FORM MODAL (ADD EVENT) */}
                        {view === "form" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 z-[3000] bg-[#0B0B0F]/98 flex flex-col p-8 md:p-16 overflow-y-auto override-scrollbar"
                            >
                                <div className="max-w-3xl mx-auto w-full">
                                    <div className="flex justify-between items-center mb-12">
                                        <div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src="/logos/Ladder-Labs-2.png" className="h-8 w-auto" alt="Logo" />
                                                <div className="h-6 w-px bg-white/10" />
                                                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">ADD <span className="text-gradient">NEW DATE</span></h3>
                                            </div>
                                            <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">Secure Data Entry Protocol</p>
                                        </div>
                                        <button onClick={handleCancel} className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                                            <X size={28} />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="group">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-brand-cyan transition-colors">Event Name</label>
                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                    placeholder="Tomorrowland Brasil, Warung Day..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-cyan focus:bg-white/[0.08] transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="group">
                                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-brand-cyan">City</label>
                                                    <input
                                                        type="text"
                                                        value={form.city}
                                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-cyan transition-all"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-brand-cyan">State</label>
                                                    <select
                                                        value={form.state}
                                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none transition-all"
                                                    >
                                                        {BRAZIL_STATES.map(s => <option key={s} value={s} className="bg-[#0B0B0F]">{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="group">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-brand-cyan">Precise Address / CEP</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={form.address}
                                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                        placeholder="Rua, Número, Bairro ou CEP"
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-cyan transition-all"
                                                    />
                                                    <button onClick={handleGeocode} disabled={geocoding} className="w-16 bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan rounded-2xl flex items-center justify-center hover:bg-brand-cyan/30">
                                                        {geocoding ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                                                    </button>
                                                </div>
                                                {pending && <p className="mt-2 text-[10px] text-green-400 font-bold uppercase">📍 Location Locked on Map!</p>}
                                                {geocodeError && <p className="mt-2 text-[10px] text-red-400 font-bold">{geocodeError}</p>}
                                            </div>

                                            <div className="group">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-brand-cyan">Event Date</label>
                                                <input
                                                    type="date"
                                                    value={form.date}
                                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-cyan transition-all"
                                                    style={{ colorScheme: "dark" }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 block">Select Artists</label>
                                                <div className="grid grid-cols-2 gap-2 mb-4 max-h-[180px] overflow-y-auto override-scrollbar pr-2">
                                                    {allArtists.map(artist => {
                                                        const active = form.lineup.includes(artist.name);
                                                        return (
                                                            <button
                                                                key={artist.name}
                                                                onClick={() => setForm(f => ({ ...f, lineup: active ? f.lineup.filter(n => n !== artist.name) : [...f.lineup, artist.name] }))}
                                                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${active ? "bg-brand-cyan border-brand-cyan text-brand-dark" : "bg-white/5 border-white/5 text-white/50 hover:border-white/20"}`}
                                                            >
                                                                <img src={artist.image} className="w-6 h-6 rounded-lg object-cover" alt="" />
                                                                <span className="text-[9px] font-bold truncate">{artist.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="group">
                                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 block">Instagram / Link</label>
                                                <input
                                                    type="text"
                                                    value={form.instagram}
                                                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                                                    placeholder="@event_profile"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-cyan transition-all"
                                                />
                                            </div>

                                            <div className="pt-8">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={!form.name || !form.city || !pending}
                                                    className="w-full py-6 rounded-3xl bg-brand-cyan text-brand-dark text-lg font-black uppercase tracking-tighter disabled:opacity-20 disabled:scale-95 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,242,255,0.4)] transition-all"
                                                >
                                                    Publish Event Live
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
