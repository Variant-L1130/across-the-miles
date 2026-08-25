import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  phase: number;
  hue: number;
}

export default function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "#f0b6c6";
    const accent2 = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() ||
      "#b9a7f5";

    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr();
      canvas.height = h * dpr();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const count = Math.min(70, Math.floor(w / 14));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: h + Math.random() * h,
        vy: -(0.15 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.22,
        r: 0.7 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random()
      }));
    };

    const draw = (t: number) => {
      const w = canvas.width / dpr();
      const h = canvas.height / dpr();
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx + Math.sin(t / 1400 + p.phase) * 0.18;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
        }
        const tw = reduced ? 0.6 : 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + p.phase));
        ctx.globalAlpha = tw * 0.75;
        ctx.fillStyle = p.hue > 0.5 ? accent() : accent2();
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (running) raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
