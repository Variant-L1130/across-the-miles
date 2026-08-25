import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CollagePhoto } from "../../lib/types";

export default function Lightbox({
  photos,
  index,
  onClose,
  onNavigate
}: {
  photos: CollagePhoto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const open = index !== null;

  const step = useCallback(
    (dir: number) => {
      if (index === null || photos.length === 0) return;
      onNavigate((index + dir + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [open, onClose, step]);

  const current = useMemo(() => (index !== null ? photos[index] : null), [index, photos]);

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(4,3,9,0.88)",
            backdropFilter: "blur(14px)",
            display: "grid",
            placeItems: "center",
            padding: "clamp(1rem, 4vw, 3rem)"
          }}
        >
          <motion.figure
            key={current.id}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="polaroid"
            style={{ maxWidth: "min(92vw, 880px)", transform: `rotate(${(index! % 2 === 0 ? -1 : 1) * 0.7}deg)` }}
          >
            <img src={current.url} alt={current.caption || ""} style={{ maxHeight: "72vh", width: "auto", maxWidth: "100%", margin: "0 auto", aspectRatio: "auto" }} />
            {current.caption && (
              <figcaption
                className="script"
                style={{ position: "static", marginTop: "0.6rem", fontSize: "1.5rem", whiteSpace: "normal" }}
              >
                {current.caption}
              </figcaption>
            )}
          </motion.figure>

          <button
            aria-label="Close"
            onClick={onClose}
            className="glass"
            style={{ position: "absolute", top: "1.2rem", right: "1.2rem", width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "var(--ink)" }}
          >
            <X size={18} />
          </button>
          {photos.length > 1 && (
            <>
              <button
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="glass"
                style={{ position: "absolute", left: "clamp(0.5rem, 2vw, 2rem)", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "var(--ink)" }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="glass"
                style={{ position: "absolute", right: "clamp(0.5rem, 2vw, 2rem)", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "var(--ink)" }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
