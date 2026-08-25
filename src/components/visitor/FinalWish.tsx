import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import type { ExperienceConfig } from "../../lib/types";
import { interpolate } from "../../lib/config";

export default function FinalWish({ config }: { config: ExperienceConfig }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const headline = useMemo(
    () => interpolate(config.finale.headline, {
      Name: config.basics.recipientName,
      Sender: config.basics.senderName,
      Date: config.basics.birthdayDate
    }),
    [config]
  );
  const message = useMemo(
    () => interpolate(config.finale.message, {
      Name: config.basics.recipientName,
      Sender: config.basics.senderName,
      Date: config.basics.birthdayDate
    }),
    [config]
  );

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let fired = false;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        const accent =
          getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
          "#f0b6c6";
        const accent2 =
          getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() ||
          "#b9a7f5";
        confetti({
          particleCount: 90,
          spread: 100,
          startVelocity: 38,
          origin: { y: 0.62 },
          colors: [accent, accent2, "#ffffff", "#ffd7de"],
          scalar: 0.9,
          ticks: 260,
          disableForReducedMotion: true
        });
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section
      id="finale"
      ref={ref as any}
      style={{
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        padding: "clamp(7rem, 20vh, 13rem) 1.5rem"
      }}
    >
      <div style={{ position: "relative", maxWidth: "50rem", margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="script"
          style={{ fontSize: "clamp(1.8rem, 4.4vw, 2.6rem)", color: "var(--accent)" }}
        >
          and so, on your day —
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 500,
            fontSize: "clamp(2.4rem, 6.4vw, 4.6rem)",
            lineHeight: 1.14,
            marginTop: "0.8rem"
          }}
        >
          {headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.55 }}
          className="serif"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
            color: "var(--muted)",
            marginTop: "1.6rem",
            lineHeight: 1.75
          }}
        >
          {message}
        </motion.p>
        {config.basics.senderName && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1 }}
            className="script"
            style={{ fontSize: "1.7rem", color: "var(--ink)", marginTop: "2.4rem" }}
          >
            — with love, {config.basics.senderName}
          </motion.p>
        )}
      </div>
    </section>
  );
}
