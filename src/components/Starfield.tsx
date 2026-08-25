import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  depth: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let raf = 0;
    let running = true;
    let scrollY = window.scrollY;
    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = performance.now() + 6000 + Math.random() * 8000;

    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.6);

    const build = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr();
      canvas.height = h * dpr();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const count = Math.min(220, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.9,
        depth: 0.25 + Math.random() * 0.75
      }));
    };

    const accentRGB = () => {
      const style = getComputedStyle(document.documentElement);
      const v = style.getPropertyValue("--accent").trim();
      return v || "#f0b6c6";
    };

    const draw = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;

      for (const s of stars) {
        const twinkle = reduced ? 0.75 : 0.55 + 0.45 * Math.sin(s.phase + time * s.speed);
        const parallax = reduced ? 0 : (scrollY * 0.06 * s.depth) % h;
        let y = s.y - parallax;
        if (y < -4) y += h;
        ctx.globalAlpha = twinkle * (0.35 + 0.65 * s.depth);
        ctx.fillStyle = s.depth > 0.8 ? accentRGB() : "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) {
        if (!shoot && t > nextShoot) {
          shoot = {
            x: w * (0.15 + Math.random() * 0.7),
            y: h * Math.random() * 0.3,
            vx: -(2.5 + Math.random() * 2),
            vy: 1.2 + Math.random(),
            life: 1
          };
          nextShoot = t + 9000 + Math.random() * 10000;
        }
        if (shoot) {
          shoot.x += shoot.vx * 2;
          shoot.y += shoot.vy * 2;
          shoot.life -= 0.016;
          const grad = ctx.createLinearGradient(
            shoot.x,
            shoot.y,
            shoot.x - shoot.vx * 26,
            shoot.y - shoot.vy * 26
          );
          grad.addColorStop(0, `rgba(255,255,255,${0.85 * Math.max(0, shoot.life)})`);
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(shoot.x - shoot.vx * 26, shoot.y - shoot.vy * 26);
          ctx.stroke();
          if (shoot.life <= 0 || shoot.x < -60 || shoot.y > h + 60) shoot = null;
        }
      }

      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
  );
}
