import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { VideoItem } from "../../lib/types";

function StoryVideo({ item, index }: { item: VideoItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.55),
      { threshold: [0, 0.55] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.play().then(
        () => undefined,
        () => {
          v.muted = true;
          setMuted(true);
          v.play().catch(() => undefined);
        }
      );
    } else {
      v.pause();
    }
  }, [active]);

  const toggleSound = (e: React.MouseEvent) => {
    e.preventDefault();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const flip = index % 2 === 1;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: flip ? "flex-end" : "flex-start",
        gap: "1rem"
      }}
    >
      <div
        className="glass"
        style={{
          position: "relative",
          width: "min(100%, 34rem)",
          padding: "clamp(0.6rem, 1.6vw, 1rem)",
          boxShadow: active ? "0 30px 80px -24px var(--accent-soft)" : "var(--shadow)",
          borderColor: active ? "var(--accent-soft)" : "var(--line)",
          transition: "box-shadow .6s ease, border-color .6s ease"
        }}
      >
        <video
          ref={videoRef}
          src={item.url}
          poster={item.poster || undefined}
          muted
          loop={false}
          playsInline
          preload="metadata"
          controls={active}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "contain", background: "#000", borderRadius: "10px" }}
        />
        {active && (
          <button
            onClick={toggleSound}
            aria-label={muted ? "Unmute" : "Mute"}
            className="glass"
            style={{
              position: "absolute",
              bottom: "0.8rem",
              left: "0.8rem",
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "rgba(8,6,14,0.6)",
              border: "1px solid var(--line)",
              color: "#fff"
            }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
      </div>
      {item.caption && (
        <p className="script" style={{ fontSize: "1.5rem", color: "var(--accent)", paddingInline: "0.4rem", maxWidth: "34rem", textAlign: flip ? "right" : "left" }}>
          {item.caption}
        </p>
      )}
    </motion.div>
  );
}

export default function VideoScrollStory({ items }: { items: VideoItem[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ maxWidth: "60rem", margin: "3.5rem auto 0", padding: "0 1.25rem", display: "grid", gap: "clamp(4rem, 12vh, 8rem)" }}>
      {items.map((it, i) => (
        <div key={it.id} style={{ position: "relative" }}>
          <span
            aria-hidden
            className="serif tabular"
            style={{
              position: "absolute",
              top: "-2.6rem",
              fontSize: "clamp(4rem, 8vw, 6rem)",
              fontWeight: 500,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.055)",
              lineHeight: 1,
              pointerEvents: "none"
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <StoryVideo item={it} index={i} />
        </div>
      ))}
    </div>
  );
}
