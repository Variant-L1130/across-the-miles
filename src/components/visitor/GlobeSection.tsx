import { useEffect, useMemo, useRef, useState } from "react";
import type { ExperienceConfig, Place } from "../../lib/types";
import { haversineMiles, milesToKm, formatNumber } from "../../lib/geo";
import { interpolate } from "../../lib/config";
import SectionHeading from "../SectionHeading";

interface Dot {
  lat: number;
  lng: number;
  b: number;
}

const rad = Math.PI / 180;

function vec3(lat: number, lng: number, rotDeg: number): [number, number, number] {
  const p = lat * rad;
  const l = (lng + rotDeg) * rad;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
}

async function buildLandDots(stepDeg: number): Promise<Dot[]> {
  try {
    const res = await fetch("/geo/land.json");
    if (!res.ok) throw new Error("no geo");
    const geo = await res.json();
    const MW = 720,
      MH = 360;
    const mask = document.createElement("canvas");
    mask.width = MW;
    mask.height = MH;
    const mctx = mask.getContext("2d", { willReadFrequently: true })!;
    mctx.fillStyle = "#000";
    mctx.fillRect(0, 0, MW, MH);
    mctx.fillStyle = "#fff";
    for (const f of geo.features ?? []) {
      const polys: number[][][][] =
        f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) {
        for (const ring of poly) {
          mctx.beginPath();
          ring.forEach(([lng, lat]: number[], i: number) => {
            const x = ((lng + 180) / 360) * MW;
            const y = ((90 - lat) / 180) * MH;
            if (i === 0) mctx.moveTo(x, y);
            else mctx.lineTo(x, y);
          });
          mctx.closePath();
          mctx.fill();
        }
      }
    }
    const data = mctx.getImageData(0, 0, MW, MH).data;
    const dots: Dot[] = [];
    for (let lat = -84; lat <= 84; lat += stepDeg) {
      for (let lng = -180; lng <= 180; lng += stepDeg) {
        const x = Math.min(MW - 1, Math.floor(((lng + 180) / 360) * MW));
        const y = Math.min(MH - 1, Math.floor(((90 - lat) / 180) * MH));
        if (data[(y * MW + x) * 4] > 120) {
          dots.push({
            lat: lat + (Math.random() - 0.5) * stepDeg * 0.5,
            lng: lng + (Math.random() - 0.5) * stepDeg * 0.5,
            b: Math.random() < 0.14 ? 2 : Math.random() < 0.55 ? 1 : 0
          });
        }
      }
    }
    return dots;
  } catch {
    return [];
  }
}

function GlobeCanvas({ from, to }: { from: Place | null; to: Place | null }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const readyRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    let cancelled = false;
    buildLandDots(mq.matches ? 2.2 : 1.6).then((dots) => {
      if (!cancelled) {
        dotsRef.current = dots;
        readyRef.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let visible = true;
    let size = 0;
    let dpr = 1;

    let rot = 40;
    let vel = reduced ? 0 : 0.055;
    let dragging = false;
    let lastX = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      size = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    const accentColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "#f0b6c6";
    const accent2Color = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() ||
      "#b9a7f5";

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rot += dx * 0.35;
      vel = dx * 0.9;
    };
    const onUp = () => {
      dragging = false;
      if (reduced) vel = 0;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    io.observe(wrap);

    const drawDotPass = (
      pass: number,
      R: number,
      cx: number,
      cy: number,
      time: number,
      baseAlpha: number,
      color: string
    ) => {
      ctx.beginPath();
      for (const d of dotsRef.current) {
        if (d.b !== pass) continue;
        const v = vec3(d.lat, d.lng, rot);
        if (v[2] <= 0.01) continue;
        const px = cx + v[0] * R;
        const py = cy - v[1] * R;
        const r = (0.62 + 0.5 * v[2]) * (dpr > 1 ? dpr * 0.85 : 1.1);
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, Math.PI * 2);
      }
      const tw = pass === 2 ? 0.55 + 0.45 * Math.sin(time / 700) : 1;
      ctx.globalAlpha = baseAlpha * tw;
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawMarker = (
      place: Place | null,
      kind: "from" | "to",
      R: number,
      cx: number,
      cy: number,
      time: number,
      accent: string,
      accent2: string
    ) => {
      if (!place) return;
      const v = vec3(place.lat, place.lng, rot);
      if (v[2] < 0.04) return;
      const px = cx + v[0] * R;
      const py = cy - v[1] * R;
      const isTo = kind === "to";
      const col = isTo ? accent2 : accent;

      const pulse = ((time / 1000) % 2.4) / 2.4;
      ctx.beginPath();
      ctx.arc(px, py, 6 + pulse * 26, 0, Math.PI * 2);
      ctx.strokeStyle = col;
      ctx.globalAlpha = (1 - pulse) * 0.5;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(px, py, isTo ? 3.4 : 2.8, 0, Math.PI * 2);
      ctx.fill();

      const label = isTo ? `✦ ${place.name}` : place.name;
      const side = px >= cx ? 14 : -14;
      const align: CanvasTextAlign = px >= cx ? "left" : "right";
      ctx.font = `${isTo ? 600 : 400} ${11 * (dpr > 1 ? 1 : 1.15)}px Outfit, sans-serif`;
      ctx.textAlign = align;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = isTo ? col : "rgba(255,255,255,0.92)";
      ctx.globalAlpha = Math.min(1, v[2] * 3);
      ctx.fillText(label, px + side, py + 4);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const drawArc = (
      a: Place | null,
      b: Place | null,
      R: number,
      cx: number,
      cy: number,
      time: number,
      accent: string,
      accent2: string
    ) => {
      if (!a || !b) return;
      const A = vec3(a.lat, a.lng, rot);
      const B = vec3(b.lat, b.lng, rot);
      const dot =
        A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
      const omega = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (omega < 0.02) return;
      const sinO = Math.sin(omega);
      const lift = 0.1 + (omega / Math.PI) * 0.28;

      const N = 140;
      const pts: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const k1 = Math.sin((1 - t) * omega) / sinO;
        const k2 = Math.sin(t * omega) / sinO;
        let x = A[0] * k1 + B[0] * k2;
        let y = A[1] * k1 + B[1] * k2;
        let z = A[2] * k1 + B[2] * k2;
        const len = Math.hypot(x, y, z) || 1;
        const s = (1 + lift * Math.sin(Math.PI * t)) / len;
        x *= s;
        y *= s;
        z *= s;
        pts.push({ x: cx + x * R, y: cy - y * R, z });
      }

      const DASHES = 22;
      const phase = (time / 1000) * 0.55;
      ctx.lineWidth = dpr > 1 ? 1.4 : 1.7;
      ctx.lineCap = "round";
      for (let i = 1; i <= N; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        if (p0.z < -0.03 && p1.z < -0.03) continue;
        const f = (((i / N) * DASHES - phase) % 1 + 1) % 1;
        if (f > 0.52) continue;
        const depthFade = Math.max(0.06, Math.min(1, ((p0.z + p1.z) / 2 + 0.25) * 2));
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.75 * depthFade;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      const headT = (phase * 1.9) % 1;
      const hi = Math.floor(headT * N);
      for (let k = 0; k < 16; k++) {
        const idx = hi - k;
        if (idx < 1 || idx > N) continue;
        const p = pts[idx];
        if (p.z < -0.03) continue;
        const fade = 1 - k / 16;
        ctx.globalAlpha = fade * 0.85;
        ctx.fillStyle = k === 0 ? "#ffffff" : accent2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (k === 0 ? 2.6 : 1.6) * fade + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (time: number) => {
      const w = size;

      if (visible && w > 0) {
        const cx = w / 2;
        const cy = w / 2;
        const R = w * 0.36;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, w);
        const accent = accentColor();
        const accent2 = accent2Color();

        let atmosphere = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R * 1.32);
        atmosphere.addColorStop(0, "rgba(0,0,0,0)");
        atmosphere.addColorStop(0.72, accent + "26");
        atmosphere.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = atmosphere;
        ctx.fillRect(0, 0, w, w);

        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        const ocean = ctx.createRadialGradient(
          cx - R * 0.35,
          cy - R * 0.4,
          R * 0.1,
          cx,
          cy,
          R * 1.05
        );
        ocean.addColorStop(0, "rgba(70, 80, 130, 0.20)");
        ocean.addColorStop(0.65, "rgba(18, 20, 42, 0.34)");
        ocean.addColorStop(1, "rgba(4, 4, 10, 0.6)");
        ctx.fillStyle = ocean;
        ctx.fill();

        if (dotsRef.current.length === 0) {
          ctx.beginPath();
          for (let lat = -60; lat <= 60; lat += 20) {
            for (let lng = -180; lng < 180; lng += 12) {
              const v = vec3(lat, lng, rot);
              if (v[2] <= 0.02) continue;
              ctx.moveTo(cx + v[0] * R, cy - v[1] * R);
              ctx.arc(cx + v[0] * R, cy - v[1] * R, 0.8, 0, Math.PI * 2);
            }
          }
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = accent2;
          ctx.fill();
        } else {
          drawDotPass(0, R, cx, cy, time, 0.34, "rgba(255,255,255,0.85)");
          drawDotPass(1, R, cx, cy, time, 0.55, accent2);
          drawDotPass(2, R, cx, cy, time, 0.95, accent);
        }

        drawArc(from, to, R, cx, cy, time, accent, accent2);
        drawMarker(from, "from", R, cx, cy, time, accent, accent2);
        drawMarker(to, "to", R, cx, cy, time, accent, accent2);

        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        const rim = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
        rim.addColorStop(0, "rgba(0,0,0,0)");
        rim.addColorStop(1, "rgba(0,0,0,0.5)");
        ctx.fillStyle = rim;
        ctx.fill();
      }

      if (!dragging && visible) {
        if (reduced) vel = 0;
        else vel += (0.055 - vel) * 0.012;
        rot += vel * 0.16;
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [from, to]);

  return (
    <div ref={wrapRef} style={{ width: "min(88vw, min(520px, 78vh))", aspectRatio: "1", margin: "0 auto", touchAction: "pan-y" }}>
      <canvas ref={canvasRef} style={{ cursor: "grab", display: "block" }} />
    </div>
  );
}

export default function GlobeSection({ config }: { config: ExperienceConfig }) {
  const { from, to } = config.places;
  const miles = useMemo(() => (from && to ? haversineMiles(from, to) : null), [from, to]);

  const vars = {
    Name: config.basics.recipientName,
    Sender: config.basics.senderName,
    From: from?.name ?? "",
    To: to?.name ?? "",
    Miles: miles !== null ? formatNumber(miles) : "",
    Date: config.basics.birthdayDate
  };
  const tagline = interpolate(config.journeyTagline, vars);

  return (
    <section id="journey" style={{ position: "relative", zIndex: 1, padding: "clamp(5rem, 12vh, 9rem) 1.5rem" }}>
      <SectionHeading kicker="two points on one small planet" title={<>A World <em>Apart</em></>} />
      <div style={{ marginTop: "clamp(2rem, 5vh, 3.5rem)" }}>
        <GlobeCanvas from={from} to={to} />
      </div>
      <div
        style={{
          marginTop: "2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.9rem"
        }}
      >
        {miles !== null && (
          <div className="glass" style={{ padding: "1rem 1.8rem", borderRadius: "999px" }}>
            <span className="serif tabular" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.1rem)", fontWeight: 500 }}>
              ≈ {formatNumber(miles)}
            </span>
            <span style={{ letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "0.68rem", color: "var(--muted)", marginLeft: "0.6rem" }}>
              miles
            </span>
            <span style={{ color: "var(--faint)", margin: "0 0.7rem" }}>·</span>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{formatNumber(milesToKm(miles))} km</span>
          </div>
        )}
        {(from || to) && (
          <p className="script" style={{ fontSize: "clamp(1.5rem, 3.6vw, 2.1rem)", color: "var(--accent)", maxWidth: "46rem", padding: "0 1rem" }}>
            {tagline}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
          {from && (
            <span className="chip">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
              {from.name}, {from.country}
            </span>
          )}
          {to && (
            <span className="chip">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-2)", boxShadow: "0 0 8px var(--accent-2)" }} />
              {to.name}, {to.country}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
