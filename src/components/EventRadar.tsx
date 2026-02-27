/**
 * Ladder Labs Event Radar — Manual Event Editor
 * Click the map to pin an event, fill in the form, save to localStorage.
 */

import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback } from "react";
import { MapPin, Calendar, Instagram, Plus, Trash2, Save, X, List, Map } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
    notes: string;
}

const STORAGE_KEY = "ladder-radar-events";

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

// ─── Map click handler component ────────────────────────────────────────────
function MapClickHandler({
    active,
    onMapClick,
}: {
    active: boolean;
    onMapClick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            if (active) onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ─── Empty form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
    name: "",
    promoter: "",
    city: "",
    state: "SP",
    date: "",
    instagram: "",
    genres: [] as string[],
    notes: "",
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EventRadar({ t }: { t: any }) {
    const [events, setEvents] = useState<ManualEvent[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [view, setView] = useState<"list" | "form" | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => { setIsLoaded(true); }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }, [events]);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setPending({ lat, lng });
        setForm(EMPTY_FORM);
        setView("form");
        setAddMode(false);
    }, []);

    const handleSave = () => {
        if (!pending || !form.name.trim() || !form.city.trim()) return;
        const newEvent: ManualEvent = {
            id: `evt-${Date.now()}`,
            ...form,
            lat: pending.lat,
            lng: pending.lng,
        };
        setEvents((prev) => [...prev, newEvent]);
        setPending(null);
        setForm(EMPTY_FORM);
        setView("list");
    };

    const handleCancel = () => {
        setPending(null);
        setForm(EMPTY_FORM);
        setView(events.length > 0 ? "list" : null);
        setAddMode(false);
    };

    const handleDelete = (id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setDeleteConfirm(null);
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
                            setAddMode(!addMode);
                            if (!addMode) setView(null);
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

                    {/* Export */}
                    {events.length > 0 && (
                        <button
                            onClick={handleExport}
                            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50 transition-all"
                        >
                            ↓ Exportar JSON
                        </button>
                    )}
                </motion.div>

                {/* Instruction banner when in add mode */}
                <AnimatePresence>
                    {addMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 px-5 py-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 flex items-center gap-3"
                        >
                            <MapPin size={14} className="text-brand-cyan shrink-0" />
                            <p className="text-[10px] text-brand-cyan/80 font-bold uppercase tracking-widest">
                                Clique em qualquer ponto do mapa para marcar um evento
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Map + Panel Layout */}
                <div className={`grid gap-6 ${view ? "lg:grid-cols-[1fr_340px]" : "grid-cols-1"}`}>

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
                                center={[-14.235, -51.925]}
                                zoom={4}
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

                                {/* Pending (unconfirmed) marker — label only, no dot (CircleMarker has the dot) */}
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
                                {events.map((event) => (
                                    <>
                                        {/* Dot marker */}
                                        <CircleMarker
                                            key={`dot-${event.id}`}
                                            center={[event.lat, event.lng]}
                                            radius={10}
                                            pathOptions={{
                                                fillColor: "#FF2D7A",
                                                fillOpacity: 0.9,
                                                color: "#0B0B0F",
                                                weight: 2,
                                            }}
                                        >
                                            <Popup className="radar-popup">
                                                <div className="radar-popup-content">
                                                    <div className="radar-popup-title">{event.name}</div>
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
                                                    {event.notes && (
                                                        <div className="radar-popup-row" style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                                                            {event.notes}
                                                        </div>
                                                    )}
                                                    {event.instagram && (
                                                        <a
                                                            href={event.instagram.startsWith("http") ? event.instagram : `https://instagram.com/${event.instagram.replace("@", "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="radar-popup-ig"
                                                        >
                                                            <Instagram size={12} />
                                                            {event.instagram.startsWith("http") ? "Instagram" : event.instagram}
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteConfirm(event.id)}
                                                        className="radar-popup-ig mt-1"
                                                        style={{ color: "#FF4444", borderTop: "none" }}
                                                    >
                                                        <Trash2 size={12} />
                                                        {t.deleteEvent}
                                                    </button>
                                                </div>
                                            </Popup>
                                        </CircleMarker>

                                        {/* DivIcon label above the dot */}
                                        <Marker
                                            key={`label-${event.id}`}
                                            position={[event.lat, event.lng]}
                                            icon={L.divIcon({
                                                className: "",
                                                iconAnchor: [110, 38],
                                                iconSize: [220, 30],
                                                html: `<div style="
                                                    background: rgba(11,11,15,0.82);
                                                    border: 1px solid rgba(255,45,122,0.35);
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
                                                    box-shadow: 0 2px 16px rgba(255,45,122,0.25);
                                                    pointer-events: none;
                                                ">${event.name}</div>`,
                                            })}
                                            interactive={false}
                                        />
                                    </>
                                ))}
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
                                            <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white">
                                                {t.mappedSoFar}
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

                                            {/* Genres / Vertentes */}
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

                                            {/* Coords display */}
                                            {pending && (
                                                <div className="flex items-center gap-2 text-[8px] text-white/20 font-mono">
                                                    <MapPin size={9} />
                                                    {pending.lat.toFixed(4)}, {pending.lng.toFixed(4)}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={!form.name.trim() || !form.city.trim()}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-brand-cyan text-brand-dark py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
                                                >
                                                    <Save size={12} />
                                                    {t.saveBtn}
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
                                                        className="rounded-xl border border-white/[0.06] p-3 hover:border-white/10 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-bold text-white truncate">{event.name}</p>
                                                                <p className="text-[8px] text-white/40 mt-0.5">
                                                                    {event.city}, {event.state}
                                                                    {event.date ? ` · ${new Date(event.date + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => setDeleteConfirm(event.id)}
                                                                className="text-white/20 hover:text-red-400 transition-colors ml-2 shrink-0"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>

                                                        {/* Delete confirm */}
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
                                                                            <button
                                                                                onClick={() => setDeleteConfirm(null)}
                                                                                className="px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                                                                            >
                                                                                {t.cancelDelete}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDelete(event.id)}
                                                                                className="px-3 py-1.5 rounded-md bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                                                            >
                                                                                {t.confirmDelete}
                                                                            </button>
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
