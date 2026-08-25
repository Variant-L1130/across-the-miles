import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { VideoItem } from "../../lib/types";

export default function VideoSlideshow({ items }: { items: VideoItem[] }) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const go = useCallback(
    (dir: number) => {
      setStarted(true);
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    if (!started) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => undefined);
  }, [index, started]);

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, started]);

  if (items.length === 0) return null;
  const current = items[index];

  return (
    <div style={{ maxWidth: "60rem", margin: "3rem auto 0", padding: "0 1.25rem" }}>
      <div
        className="glass"
        style={{
          position: "relative",
          padding: "clamp(0.7rem, 2vw, 1.4rem)",
          overflow: "hidden",
          boxShadow: "var(--shadow)"
        }}
      >
        <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#000", borderRadius: "14px", overflow: "hidden" }}>
          {!started ? (
            <button
              onClick={() => setStarted(true)}
              aria-label="Play memories"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                border: "none",
                background: `url(${current.poster || ""}) center/cover no-repeat, #000`,
                cursor: "pointer"
              }}
            >
              <span
                className="glass"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.9rem 1.9rem",
                  borderRadius: "999px",
                  background: "rgba(10,8,18,0.55)",
                  color: "#fff",
                  fontSize: "0.95rem",
                  letterSpacing: "0.08em"
                }}
              >
                <Play size={17} fill="currentColor" /> play the memories
              </span>
            </button>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0 }}
              >
                <video
                  ref={videoRef}
                  src={current.url}
                  poster={current.poster || undefined}
                  controls
                  playsInline
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  onEnded={() => go(1)}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.9rem 0.4rem 0.2rem"
          }}
        >
          <button className="btn" onClick={() => go(-1)} aria-label="Previous memory" style={{ padding: "0.5rem 1rem" }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            {current.caption && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="script"
                  style={{ fontSize: "1.35rem", color: "var(--accent)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {current.caption}
                </motion.p>
              </AnimatePresence>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.45rem", marginTop: "0.5rem" }}>
              {items.map((it, i) => (
                <button
                  key={it.id}
                  aria-label={`Go to memory ${i + 1}`}
                  onClick={() => { setStarted(true); setIndex(i); }}
                  style={{
                    width: i === index ? 22 : 7,
                    height: 7,
                    borderRadius: 99,
                    border: "none",
                    transition: "all .35s ease",
                    background: i === index ? "var(--accent)" : "rgba(255,255,255,0.22)"
                  }}
                />
              ))}
            </div>
          </div>
          <button className="btn" onClick={() => go(1)} aria-label="Next memory" style={{ padding: "0.5rem 1rem" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "var(--faint)", fontSize: "0.72rem", letterSpacing: "0.24em", textTransform: "uppercase", marginTop: "1rem" }}>
        {index + 1} / {items.length} · memories
      </p>
    </div>
  );
}
