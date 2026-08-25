import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
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

interface CollageEntry {
  id: string;
  photos: CollagePhoto[];
}

function buildEntries(photos: CollagePhoto[]): CollageEntry[] {
  const groupMap = new Map<string, CollagePhoto[]>();
  const groupOrder: string[] = [];

  for (const p of photos) {
    const gid = p.carouselId;
    if (gid) {
      if (!groupMap.has(gid)) {
        groupOrder.push(gid);
        groupMap.set(gid, []);
      }
      groupMap.get(gid)!.push(p);
    } else {
      groupMap.set(p.id, [p]);
      groupOrder.push(p.id);
    }
  }

  return groupOrder.map((id) => ({ id, photos: groupMap.get(id)! }));
}

function CarouselCard({
  entry,
  rot,
  onOpen,
  reduced,
  scrollTransform
}: {
  entry: CollageEntry;
  rot: number;
  onOpen: (slideIndex: number) => void;
  reduced: boolean;
  scrollTransform?: any;
}) {
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = entry.photos.length;
  const isCarousel = count > 1;

  const step = useCallback(
    (dir: number) => {
      setSlide((s) => (s + dir + count) % count);
    },
    [count]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        step(dx > 0 ? -1 : 1);
      }
    },
    [step]
  );

  const content = (
    <div className="carousel-viewport">
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${slide * 100}%)`,
          transition: reduced ? "none" : undefined
        }}
      >
        {entry.photos.map((p) => (
          <img key={p.id} src={p.thumb} alt={p.caption || ""} loading="lazy" />
        ))}
      </div>
      {isCarousel && (
        <div className="carousel-dots">
          {entry.photos.map((_, i) => (
            <span key={i} className={`carousel-dot ${i === slide ? "active" : ""}`} />
          ))}
        </div>
      )}
      {isCarousel && !reduced && (
        <>
          <button
            className="carousel-arrow carousel-arrow-left"
            aria-label="Previous photo"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            aria-label="Next photo"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            style={{ opacity: hovered ? 1 : 0 }}
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );

  const p = entry.photos[0];

  return (
    <motion.button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={() => onOpen(slide)}
      className="polaroid"
      style={{ position: "relative" }}
    >
      <motion.span
        style={{
          display: "block",
          ...(reduced ? {} : scrollTransform ? { translateY: scrollTransform } : {})
        }}
      >
        {content}
        {p.caption && <span className="polaroid-caption">{p.caption}</span>}
      </motion.span>
    </motion.button>
  );
}

export default function PhotoCollage({ photos }: { photos: CollagePhoto[] }) {
  const [lightboxEntryIdx, setLightboxEntryIdx] = useState<number | null>(null);
  const [lightboxSlide, setLightboxSlide] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const yFar = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yNear = useTransform(scrollYProgress, [0, 1], [110, -110]);

  const entries = useMemo(() => buildEntries(photos), [photos]);
  const slots = useMemo(() => buildSlots(entries.length), [entries]);
  if (entries.length === 0) return null;

  const isDesktop = useIsDesktop();

  const lightboxPhotos = lightboxEntryIdx !== null ? entries[lightboxEntryIdx].photos : [];

  const openLightbox = (entryIdx: number, slideIdx: number) => {
    setLightboxEntryIdx(entryIdx);
    setLightboxSlide(slideIdx);
  };

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
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08 }}
              style={{ marginBottom: "1.1rem" }}
            >
              <CarouselCard
                entry={entry}
                rot={entry.photos[0].rot * 0.6}
                onOpen={(s) => openLightbox(i, s)}
                reduced
              />
            </motion.div>
          ))}
        </div>
        <Lightbox photos={lightboxPhotos} index={lightboxEntryIdx !== null ? lightboxSlide : null} onClose={() => setLightboxEntryIdx(null)} onNavigate={setLightboxSlide} />
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
          height: `${Math.max(46, Math.ceil(entries.length / 3) * 24)}rem`,
          maxWidth: "72rem",
          margin: "2.5rem auto 0"
        }}
      >
        <div aria-hidden className="light-leak" style={{ top: "-4%", left: "8%", width: 260, height: 260, background: "var(--accent-soft)", opacity: 0.35 }} />
        <div aria-hidden className="light-leak" style={{ bottom: "6%", right: "5%", width: 320, height: 320, background: "rgba(255,255,255,0.06)" }} />
        {entries.map((entry, i) => {
          const s = slots[i];
          const p = entry.photos[0];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 60, rotate: s.rot * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: s.rot }}
              viewport={{ once: true, margin: "-6% 0px" }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05, rotate: s.rot * 0.4, zIndex: 20 }}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.w}px`,
                marginLeft: `${-s.w / 2}px`,
                zIndex: Math.round(s.depth * 10),
                boxShadow: `0 ${18 + s.depth * 26}px ${40 + s.depth * 30}px -14px rgba(0,0,0,${0.45 + s.depth * 0.2})`
              }}
            >
              <motion.span style={{ display: "block", ...(reduced ? {} : { translateY: s.depth > 0.65 ? yNear : yFar }) }}>
                <CarouselCard
                  entry={entry}
                  rot={s.rot}
                  onOpen={(sl) => openLightbox(i, sl)}
                  reduced={false}
                />
              </motion.span>
            </motion.div>
          );
        })}
        {entries.length > 0 && (
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
      <Lightbox photos={lightboxPhotos} index={lightboxEntryIdx !== null ? lightboxSlide : null} onClose={() => setLightboxEntryIdx(null)} onNavigate={setLightboxSlide} />
    </section>
  );
}
