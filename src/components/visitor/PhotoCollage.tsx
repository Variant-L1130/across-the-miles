import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import type { CollagePhoto } from "../../lib/types";
import SectionHeading from "../SectionHeading";
import Lightbox from "./Lightbox";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Slot {
  x: number;
  y: number;
  rot: number;
  w: number;
  depth: number;
}

function buildSlots(count: number): Slot[] {
  const cols = count <= 3 ? 2 : 3;
  const rows = Math.ceil(Math.max(1, count) / cols);
  const slots: Slot[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const h1 = hash(`slot-${i}-x`);
    const h2 = hash(`slot-${i}-y`);
    const h3 = hash(`slot-${i}-r`);
    slots.push({
      x: ((col + 0.5) / cols) * 100 + (((h1 % 100) / 100 - 0.5) * (86 / cols)),
      y: ((row + 0.5) / rows) * 100 + (((h2 % 100) / 100 - 0.5) * (70 / rows)),
      rot: -7 + (h3 % 140) / 10,
      w: 200 + ((h1 >> 3) % 90),
      depth: 0.4 + ((h2 >> 3) % 60) / 60
    });
  }
  return slots;
}

export default function PhotoCollage({ photos }: { photos: CollagePhoto[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const yFar = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yNear = useTransform(scrollYProgress, [0, 1], [110, -110]);

  const slots = useMemo(() => buildSlots(photos.length), [photos]);
  if (photos.length === 0) return null;

  const isDesktop = useIsDesktop();

  if (!isDesktop || reduced) {
    return (
      <section id="memories" ref={sectionRef as any} style={{ position: "relative", zIndex: 1, padding: "clamp(4rem, 10vh, 8rem) 1.25rem" }}>
        <SectionHeading kicker="little pieces of us" title={<>The <em>Memories</em></>} />
        <div
          style={{
            marginTop: "3rem",
            columns: 2,
            columnGap: "1rem",
            maxWidth: "44rem",
            marginInline: "auto"
          }}
        >
          {photos.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08 }}
              onClick={() => setLightbox(i)}
              className="polaroid"
              style={{
                display: "block",
                width: "100%",
                marginBottom: "1.1rem",
                border: "none",
                transform: `rotate(${p.rot * 0.6}deg)`
              }}
            >
              <img src={p.thumb} alt={p.caption || ""} loading="lazy" style={{ aspectRatio: "auto" }} />
              {p.caption && <span className="polaroid-caption">{p.caption}</span>}
            </motion.button>
          ))}
        </div>
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
      </section>
    );
  }

  return (
    <section id="memories" ref={sectionRef as any} style={{ position: "relative", zIndex: 1 }}>
      <div style={{ paddingTop: "clamp(4rem, 10vh, 8rem)" }}>
        <SectionHeading kicker="little pieces of us" title={<>The <em>Memories</em></>} />
      </div>
      <div
        style={{
          position: "relative",
          height: `${Math.max(46, Math.ceil(photos.length / 3) * 24)}rem`,
          maxWidth: "72rem",
          margin: "2.5rem auto 0"
        }}
      >
        <div aria-hidden className="light-leak" style={{ top: "-4%", left: "8%", width: 260, height: 260, background: "var(--accent-soft)", opacity: 0.35 }} />
        <div aria-hidden className="light-leak" style={{ bottom: "6%", right: "5%", width: 320, height: 320, background: "rgba(255,255,255,0.06)" }} />
        {photos.map((p, i) => {
          const s = slots[i];
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 60, rotate: s.rot * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: s.rot }}
              viewport={{ once: true, margin: "-6% 0px" }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05, rotate: s.rot * 0.4, zIndex: 20 }}
              onClick={() => setLightbox(i)}
              className="polaroid"
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.w}px`,
                marginLeft: `${-s.w / 2}px`,
                zIndex: Math.round(s.depth * 10),
                border: "none",
                cursor: "pointer",
                boxShadow: `0 ${18 + s.depth * 26}px ${40 + s.depth * 30}px -14px rgba(0,0,0,${0.45 + s.depth * 0.2})`
              }}
            >
              <motion.span style={{ display: "block", ...(reduced ? {} : { translateY: s.depth > 0.65 ? yNear : yFar }) }}>
                <img src={p.thumb} alt={p.caption || ""} loading="lazy" style={{ aspectRatio: "auto" }} />
                {p.caption && <span className="polaroid-caption">{p.caption}</span>}
              </motion.span>
            </motion.button>
          );
        })}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            style={{
              position: "absolute",
              bottom: "-0.5rem",
              left: 0,
              right: 0,
              textAlign: "center",
              color: "var(--faint)",
              fontSize: "0.78rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <Camera size={13} /> tap a photo to hold it closer
          </motion.div>
        )}
      </div>
      <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
    </section>
  );
}
