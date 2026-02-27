/**
 * StudioBackground -> Ascension Background
 * Abstract, minimalist geometry representing the "climb" and BPM progression.
 */
import { useEffect, useRef } from "react";

const CYAN = "#00F2FF";
const PINK = "#FF00E5";

interface RisingSpark { x: number; y: number; speed: number; size: number; opacity: number; color: string }
interface GlowingStep { y: number; width: number; opacity: number; pulseSpeed: number; phase: number }

export default function AscensionBackground() {
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

        // --- Rising Sparks (BPM Energy) ---
        const sparks: RisingSpark[] = Array.from({ length: 40 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 0.2 + Math.random() * 0.8,
            size: 0.5 + Math.random() * 2,
            opacity: Math.random() * 0.4,
            color: Math.random() > 0.8 ? PINK : CYAN
        }));

        // --- Geometric Steps (The Ladder) ---
        const steps: GlowingStep[] = Array.from({ length: 12 }, (_, i) => ({
            y: (canvas.height / 12) * i,
            width: canvas.width * (0.3 + Math.random() * 0.4),
            opacity: 0.02 + Math.random() * 0.05,
            pulseSpeed: 0.005 + Math.random() * 0.015,
            phase: Math.random() * Math.PI * 2
        }));

        let time = 0;
        let animId = 0;

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            time += 0.01;

            // 1. Draw The Ladder (Horizontal pulsing gradients)
            steps.forEach((step, i) => {
                // Move steps up slowly to create climbing illusion
                step.y -= 0.15;
                if (step.y < -50) step.y = H + 50;

                const currentOpacity = step.opacity + Math.sin(time + step.phase) * 0.02;

                const grd = ctx.createLinearGradient(W / 2 - step.width / 2, 0, W / 2 + step.width / 2, 0);
                grd.addColorStop(0, "transparent");
                grd.addColorStop(0.5, `rgba(0, 242, 255, ${Math.max(0, currentOpacity)})`);
                grd.addColorStop(1, "transparent");

                ctx.fillStyle = grd;
                ctx.fillRect(W / 2 - step.width / 2, step.y, step.width, 1);

                // Add a thicker, far fainter base to the step
                ctx.fillStyle = `rgba(0, 242, 255, ${Math.max(0, currentOpacity * 0.2)})`;
                ctx.fillRect(W / 2 - step.width / 2, step.y, step.width, 15);
            });

            // 2. Draw Vertical Light Rays 
            const rayCount = 5;
            for (let i = 0; i < rayCount; i++) {
                const rayX = (W / rayCount) * i + (Math.sin(time * 0.5 + i) * 100);
                const rayOp = 0.015 + Math.sin(time + i) * 0.01;

                const vGrd = ctx.createLinearGradient(0, H, 0, 0);
                vGrd.addColorStop(0, `rgba(0, 242, 255, ${Math.max(0, rayOp)})`);
                vGrd.addColorStop(1, "transparent");

                ctx.fillStyle = vGrd;
                // Skew the rays to look like structural beams
                ctx.beginPath();
                ctx.moveTo(rayX - 40, H);
                ctx.lineTo(rayX + 40, H);
                ctx.lineTo(rayX + 120, 0);
                ctx.lineTo(rayX + 80, 0);
                ctx.fill();
            }

            // 3. Draw Rising Sparks
            sparks.forEach(spark => {
                spark.y -= spark.speed;
                // Slight horizontal drift
                spark.x += Math.sin(time * 2 + spark.y * 0.01) * 0.3;

                if (spark.y < 0) {
                    spark.y = H;
                    spark.x = Math.random() * W;
                }

                ctx.beginPath();
                ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
                ctx.fillStyle = spark.color;
                ctx.globalAlpha = spark.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Occasional glow pulse on sparks
                if (Math.sin(time * 5 + spark.x) > 0.9) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = spark.color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

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
            className="fixed inset-0 pointer-events-none select-none transition-opacity duration-1000"
            style={{ zIndex: 0, opacity: 1, mixBlendMode: 'screen' }}
            aria-hidden="true"
        />
    );
}
