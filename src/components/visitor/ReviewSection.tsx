import { motion, useReducedMotion } from "framer-motion";
import type { ExperienceConfig } from "../../lib/types";

export default function ReviewSection({ config }: { config: ExperienceConfig }) {
  const photo = config.review.photo;
  const reduced = useReducedMotion();
  if (!photo?.url) return null;

  const name = config.basics.recipientName;

  return (
    <section
      id="review"
      style={{
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        padding: "clamp(5rem, 14vh, 9rem) 1.5rem"
      }}
    >
      <div style={{ maxWidth: "44rem", margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="script"
          style={{ fontSize: "clamp(1.8rem, 4.4vw, 2.6rem)", color: "var(--accent)" }}
        >
          a memory to keep forever
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="polaroid"
          style={{
            maxWidth: 420,
            margin: "2.2rem auto 0",
            boxShadow: "var(--shadow)"
          }}
        >
          <img
            src={photo.url}
            alt=""
            style={{
              width: "100%",
              aspectRatio: photo.width && photo.height ? `${photo.width}/${photo.height}` : "auto",
              objectFit: "cover",
              borderRadius: 3
            }}
          />
          {name && (
            <span className="polaroid-caption">{name}</span>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.7 }}
          className="serif"
          style={{
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
            color: "var(--muted)",
            marginTop: "2.2rem",
            lineHeight: 1.75
          }}
        >
          This one’s for you — and the memories we’ll make next.
        </motion.p>
      </div>
    </section>
  );
}
