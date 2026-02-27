/**
 * StudioBackground
 * Animated canvas background — circuits, CDJs, knobs, waveforms, music notes
 */
import { useEffect, useRef } from "react";

const CYAN = "#00F2FF";
const PINK = "#FF2D7A";

interface CircuitNode { x: number; y: number; connections: number[] }
interface Particle { from: number; to: number; progress: number; speed: number; color: string }
interface FloatingSymbol { x: number; y: number; vy: number; opacity: number; symbol: string; size: number; rotation: number; rotSpeed: number }
interface EQBar { height: number; target: number; color: string }
interface Knob { x: number; y: number; angle: number; speed: number; radius: number; color: string }

export default function StudioBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // --- Circuit nodes ---
        const NODE_COUNT = 30;
        const nodes: CircuitNode[] = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            connections: [] as number[],
        }));
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (d < 260) {
                    nodes[i].connections.push(j);
                    nodes[j].connections.push(i);
                }
            }
        }

        // --- Signal particles ---
        const particles: Particle[] = [];
        for (let i = 0; i < 18; i++) {
            const fi = Math.floor(Math.random() * nodes.length);
            if (!nodes[fi].connections.length) continue;
            particles.push({
                from: fi,
                to: nodes[fi].connections[Math.floor(Math.random() * nodes[fi].connections.length)],
                progress: Math.random(),
                speed: 0.0015 + Math.random() * 0.003,
                color: Math.random() > 0.5 ? CYAN : PINK,
            });
        }

        // --- Floating music symbols ---
        const SYMBOLS = ["♩", "♪", "♫", "♬", "𝄞", "🎵"];
        const floats: FloatingSymbol[] = Array.from({ length: 14 }, () => ({
            x: Math.random() * (canvas.width || 1920),
            y: Math.random() * (canvas.height || 1080),
            vy: -(0.08 + Math.random() * 0.18),
            opacity: 0.018 + Math.random() * 0.035,
            symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            size: 12 + Math.random() * 22,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.008,
        }));

        // --- EQ Bars ---
        const EQ_COUNT = 48;
        const eqBars: EQBar[] = Array.from({ length: EQ_COUNT }, (_, i) => ({
            height: 10 + Math.random() * 60,
            target: 10 + Math.random() * 60,
            color: i % 3 === 0 ? PINK : CYAN,
        }));

        // --- Knobs ---
        const knobData: Knob[] = [
            { x: 0.06, y: 0.18, angle: 0, speed: 0.008, radius: 18, color: CYAN },
            { x: 0.94, y: 0.52, angle: 1.2, speed: -0.006, radius: 20, color: PINK },
            { x: 0.80, y: 0.82, angle: 0.8, speed: 0.005, radius: 15, color: CYAN },
            { x: 0.20, y: 0.60, angle: 2.1, speed: -0.007, radius: 17, color: PINK },
            { x: 0.50, y: 0.08, angle: 0.5, speed: 0.004, radius: 14, color: CYAN },
        ];

        // CDJ angles
        let cdj1A = 0, cdj2A = 0;
        let waveT = 0;
        let animId = 0;

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            waveT += 0.018;
            cdj1A += 0.0025;
            cdj2A -= 0.0018;

            // ── CIRCUIT LINES ──────────────────────────────────────
            ctx.lineWidth = 0.6;
            for (let i = 0; i < nodes.length; i++) {
                for (const j of nodes[i].connections) {
                    if (j < i) continue;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    // Elbow-style routing (90° bends like PCB traces)
                    const mx = (nodes[i].x + nodes[j].x) / 2;
                    ctx.lineTo(mx, nodes[i].y);
                    ctx.lineTo(mx, nodes[j].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = "rgba(0,242,255,0.045)";
                    ctx.stroke();
                }
            }

            // ── CIRCUIT NODE DOTS ───────────────────────────────────
            for (const n of nodes) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0,242,255,0.14)";
                ctx.fill();
                // Square pad at junction
                ctx.fillStyle = "rgba(0,242,255,0.07)";
                ctx.fillRect(n.x - 4, n.y - 4, 8, 8);
            }

            // ── SIGNAL PARTICLES ────────────────────────────────────
            for (const p of particles) {
                p.progress += p.speed;
                if (p.progress >= 1) {
                    const prev = p.to;
                    const prevNode = nodes[prev];
                    if (prevNode.connections.length) {
                        p.from = prev;
                        p.to = prevNode.connections[Math.floor(Math.random() * prevNode.connections.length)];
                    }
                    p.progress = 0;
                }
                const fn = nodes[p.from], tn = nodes[p.to];
                const t = p.progress;
                // Follow elbow path
                const mx = (fn.x + tn.x) / 2;
                let px: number, py: number;
                if (t < 0.5) {
                    px = fn.x + (mx - fn.x) * (t * 2);
                    py = fn.y;
                } else {
                    px = mx + (tn.x - mx) * ((t - 0.5) * 2);
                    py = fn.y + (tn.y - fn.y) * ((t - 0.5) * 2);
                }

                const grd = ctx.createRadialGradient(px, py, 0, px, py, 7);
                grd.addColorStop(0, p.color + "BB");
                grd.addColorStop(1, p.color + "00");
                ctx.beginPath();
                ctx.arc(px, py, 7, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }

            // ── OSCILLOSCOPE WAVEFORMS ─────────────────────────────
            // Bottom waveform
            ctx.beginPath();
            for (let x = 0; x <= W; x++) {
                const y = H * 0.93
                    + Math.sin((x / W * 10 * Math.PI) + waveT) * 10
                    + Math.sin((x / W * 4 * Math.PI) - waveT * 0.7) * 5;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = "rgba(0,242,255,0.1)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Mid waveform
            ctx.beginPath();
            for (let x = 0; x <= W; x++) {
                const y = H * 0.5
                    + Math.sin((x / W * 20 * Math.PI) + waveT * 1.5) * 3;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = "rgba(255,45,122,0.04)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // ── EQ BARS (top) ───────────────────────────────────────
            const barW = (W / EQ_COUNT) * 0.55;
            eqBars.forEach((b, i) => {
                b.height += (b.target - b.height) * 0.06;
                if (Math.abs(b.height - b.target) < 2) b.target = 8 + Math.random() * 55;
                const bx = (W / EQ_COUNT) * i + (W / EQ_COUNT) * 0.5;
                const bh = b.height * 0.055;
                ctx.fillStyle = b.color + "18";
                ctx.fillRect(bx - barW / 2, H * 0.03, barW, bh);
                // Top cap
                ctx.fillStyle = b.color + "35";
                ctx.fillRect(bx - barW / 2, H * 0.03, barW, 1.5);
            });

            // ── CDJ PLATTERS ────────────────────────────────────────
            const drawCDJ = (cx: number, cy: number, r: number, angle: number, color: string) => {
                // Outer ring
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = color + "10";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Groove rings
                for (let ri = 0.85; ri > 0.25; ri -= 0.12) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, r * ri, 0, Math.PI * 2);
                    ctx.strokeStyle = color + `${Math.round(ri * 8).toString(16).padStart(2, "0")}`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
                // Rotating playhead
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(angle) * r * 0.85, cy + Math.sin(angle) * r * 0.85);
                ctx.strokeStyle = color + "25";
                ctx.lineWidth = 1;
                ctx.stroke();
                // Center spindle
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fillStyle = color + "40";
                ctx.fill();
                // Label ring
                ctx.beginPath();
                ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
                ctx.strokeStyle = color + "12";
                ctx.lineWidth = 0.5;
                ctx.stroke();
            };

            const cdjR = Math.min(W, H) * 0.07;
            drawCDJ(W * 0.88, H * 0.2, cdjR, cdj1A, CYAN);
            drawCDJ(W * 0.12, H * 0.78, cdjR * 0.88, cdj2A, PINK);

            // ── KNOBS ───────────────────────────────────────────────
            for (const k of knobData) {
                k.angle += k.speed;
                const kx = k.x * W, ky = k.y * H;
                // Track arc
                ctx.beginPath();
                ctx.arc(kx, ky, k.radius, 0.75 * Math.PI, 2.25 * Math.PI);
                ctx.strokeStyle = k.color + "18";
                ctx.lineWidth = 2;
                ctx.stroke();
                // Active arc up to indicator
                const normA = ((k.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const startA = 0.75 * Math.PI;
                ctx.beginPath();
                ctx.arc(kx, ky, k.radius, startA, normA);
                ctx.strokeStyle = k.color + "45";
                ctx.lineWidth = 2;
                ctx.stroke();
                // Indicator line
                ctx.beginPath();
                ctx.moveTo(kx + Math.cos(k.angle) * 5, ky + Math.sin(k.angle) * 5);
                ctx.lineTo(kx + Math.cos(k.angle) * (k.radius - 2), ky + Math.sin(k.angle) * (k.radius - 2));
                ctx.strokeStyle = k.color + "55";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Center
                ctx.beginPath();
                ctx.arc(kx, ky, 4, 0, Math.PI * 2);
                ctx.fillStyle = k.color + "25";
                ctx.fill();
                // Tick marks
                for (let t = 0; t < 8; t++) {
                    const ta = 0.75 * Math.PI + (t / 7) * 1.5 * Math.PI;
                    ctx.beginPath();
                    ctx.moveTo(kx + Math.cos(ta) * (k.radius + 3), ky + Math.sin(ta) * (k.radius + 3));
                    ctx.lineTo(kx + Math.cos(ta) * (k.radius + 5), ky + Math.sin(ta) * (k.radius + 5));
                    ctx.strokeStyle = k.color + "20";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // ── FLOATING MUSIC SYMBOLS ──────────────────────────────
            for (const f of floats) {
                f.y += f.vy;
                f.rotation += f.rotSpeed;
                if (f.y < -40) { f.y = H + 10; f.x = Math.random() * W; }
                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.rotation);
                ctx.globalAlpha = f.opacity;
                ctx.font = `${f.size}px serif`;
                ctx.fillStyle = "white";
                ctx.fillText(f.symbol, 0, 0);
                ctx.restore();
                ctx.globalAlpha = 1;
            }


            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none select-none"
            style={{ zIndex: 0, opacity: 1 }}
            aria-hidden="true"
        />
    );
}
