import { motion } from "framer-motion";
import type { ExperienceConfig } from "../../lib/types";
import { interpolate } from "../../lib/config";

export default function DistanceLetter({ config }: { config: ExperienceConfig }) {
  const words = interpolate(config.distanceMessage, {
    Name: config.basics.recipientName,
    Sender: config.basics.senderName,
    From: config.places.from?.name ?? "",
    To: config.places.to?.name ?? "",
    Miles: "",
    Date: config.basics.birthdayDate
  })
    .split(" ")
    .filter(Boolean);

  return (
    <section
      id="apart"
      style={{
        position: "relative",
        zIndex: 1,
        padding: "clamp(6rem, 16vh, 11rem) 1.5rem"
      }}
    >
      <div style={{ maxWidth: "52rem", margin: "0 auto", textAlign: "center" }}>
        <span
          aria-hidden
          className="script"
          style={{
            fontSize: "clamp(4rem, 9vw, 7rem)",
            lineHeight: 0.4,
            color: "var(--accent)",
            opacity: 0.55,
            display: "block"
          }}
        >
          “
        </span>
        <p
          className="serif"
          style={{
            fontSize: "clamp(1.45rem, 3.2vw, 2.15rem)",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.65,
            color: "var(--ink)"
          }}
        >
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.08, filter: "blur(3px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-18% 0px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.028, 2.4) }}
              style={{ marginRight: "0.32em", display: "inline-block" }}
            >
              {w}
            </motion.span>
          ))}
        </p>
        <div className="hairline" />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ letterSpacing: "0.3em", textTransform: "uppercase", fontSize: "0.72rem", color: "var(--muted)" }}
        >
          {config.basics.senderName ? `— ${config.basics.senderName}` : "— with all my love"}
        </motion.p>
      </div>
    </section>
  );
}
