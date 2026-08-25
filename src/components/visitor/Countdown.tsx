import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cake } from "lucide-react";
import confetti from "canvas-confetti";
import type { ExperienceConfig } from "../../lib/types";
import type { CountdownParts } from "../../lib/countdown";
import { breakdown, formatDateTimeLocal, pad2 } from "../../lib/countdown";
import SectionHeading from "../SectionHeading";

const UNITS: [keyof CountdownParts, string][] = [
  ["years", "Years"],
  ["months", "Months"],
  ["weeks", "Weeks"],
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"]
];

function Cell({ value, label, pulse }: { value: number; label: string; pulse?: boolean }) {
  return (
    <div style={{ textAlign: "center", minWidth: "clamp(3.4rem, 9vw, 4.6rem)" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="serif tabular"
          style={{
            fontSize: "clamp(1.7rem, 4.4vw, 2.7rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            color: pulse ? "var(--accent)" : "var(--ink)"
          }}
        >
          {pad2(value)}
        </motion.div>
      </AnimatePresence>
      <div
        style={{
          fontSize: "0.58rem",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "var(--faint)",
          marginTop: "0.25rem"
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function Countdown({ config }: { config: ExperienceConfig }) {
  const target = useMemo(() => {
    if (!config.countdownTarget) return null;
    const d = new Date(config.countdownTarget);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [config.countdownTarget]);
  const [now, setNow] = useState(() => new Date());
  const celebratedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const parts = useMemo(
    () => (target ? breakdown(target, now) : null),
    [target, now]
  );

  useEffect(() => {
    if (target && !parts && !celebratedRef.current) {
      celebratedRef.current = true;
      const accent =
        getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
        "#f0b6c6";
      confetti({
        particleCount: 140,
        spread: 130,
        origin: { y: 0.5 },
        colors: [accent, "#ffffff"],
        disableForReducedMotion: true
      });
    }
  }, [parts, target]);

  return (
    <section
      id="countdown"
      style={{
        position: "relative",
        zIndex: 1,
        padding: "clamp(4rem, 10vh, 7rem) 1.25rem clamp(3rem, 8vh, 5rem)"
      }}
    >
      <SectionHeading kicker="counting every second" title={<>Until We <em>Celebrate</em></>} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9 }}
        className="glass"
        style={{
          maxWidth: "56rem",
          margin: "2.5rem auto 0",
          padding: "clamp(1.4rem, 4vw, 2.6rem) clamp(1rem, 3vw, 2rem)",
          boxShadow: "var(--shadow)"
        }}
      >
        {parts ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "flex-start",
              rowGap: "1.4rem"
            }}
          >
            {UNITS.map(([key, label], i) => (
              <div key={key} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span aria-hidden style={{ color: "var(--faint)", margin: "0 clamp(0.3rem, 1.4vw, 0.9rem)", alignSelf: "center", transform: "translateY(-0.55rem)", fontSize: "1.1rem" }}>
                    ·
                  </span>
                )}
                <Cell value={parts[key]} label={label} pulse={key === "seconds"} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--accent-soft)", border: "1px solid var(--accent)" }}
            >
              <Cake size={26} color="var(--accent)" />
            </motion.div>
            <p className="script" style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)", color: "var(--accent)", marginTop: "1.1rem" }}>
              The day has arrived
            </p>
            <p style={{ color: "var(--muted)", marginTop: "0.4rem" }}>
              Happy Birthday{config.basics.recipientName ? `, ${config.basics.recipientName}` : ""} — today is all yours.
            </p>
          </div>
        )}
        {target && (
          <p style={{ textAlign: "center", color: "var(--faint)", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "1.6rem" }}>
            {formatDateTimeLocal(target.toISOString())}
          </p>
        )}
      </motion.div>
      <footer style={{ textAlign: "center", marginTop: "3.5rem", color: "var(--faint)", fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase" }}>
        made with love · across the miles
      </footer>
    </section>
  );
}
