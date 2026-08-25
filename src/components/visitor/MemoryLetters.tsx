import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import type { LetterCard } from "../../lib/types";
import SectionHeading from "../SectionHeading";

export default function MemoryLetters({ letters }: { letters: LetterCard[] }) {
  const valid = letters.filter((l) => l.title.trim() || l.body.trim());
  if (valid.length === 0) return null;

  return (
    <section id="letters" style={{ position: "relative", zIndex: 1, padding: "clamp(4rem, 10vh, 8rem) 1.5rem" }}>
      <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
        <SectionHeading kicker="words kept safe" title={<>Letters I Never <em>Sent</em></>} />
        <div style={{ marginTop: "3rem", display: "grid", gap: "1.2rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))" }}>
          {valid.map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 1.5 : -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.6 : -0.6 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ rotate: 0, y: -6 }}
              className="glass"
              style={{ padding: "1.7rem 1.6rem", position: "relative", overflow: "hidden" }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-30%",
                  right: "-20%",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "var(--accent-soft)",
                  filter: "blur(46px)"
                }}
              />
              <HeartHandshake size={20} color="var(--accent)" strokeWidth={1.5} />
              {l.title && (
                <h3 className="serif" style={{ fontSize: "1.45rem", fontWeight: 500, marginTop: "0.7rem" }}>
                  {l.title}
                </h3>
              )}
              <p style={{ marginTop: l.title ? "0.6rem" : "0.9rem", color: "var(--muted)", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                {l.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
