import { motion } from "framer-motion";
import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { ExperienceConfig } from "../../lib/types";
import { interpolate } from "../../lib/config";

const COLOR_MAP: Record<string, string> = {
  ivory: "#fff8ee",
  gold: "#f6d38b",
  blush: "#ffd7de"
};

const FONT_FAMILY: Record<string, string> = {
  serif: "var(--serif)",
  script: "var(--script)",
  sans: "var(--sans)"
};

export default function Hero({ config }: { config: ExperienceConfig }) {
  const style = config.hero.style;
  const photo = config.hero.photo;
  const name = config.basics.recipientName;
  const vars = useMemo(() => ({
    Name: name,
    Sender: config.basics.senderName,
    Date: config.basics.birthdayDate
  }), [name, config.basics.senderName, config.basics.birthdayDate]);

  const subtitle = useMemo(() => interpolate(config.basics.subtitle, vars), [config.basics.subtitle, vars]);
  const message = useMemo(() => interpolate(config.basics.heroMessage, vars), [config.basics.heroMessage, vars]);

  const justify = style.align === "center" ? "center" : style.align === "right" ? "flex-end" : "flex-start";
  const vPos = style.textPos === "top" ? "flex-start" : style.textPos === "center" ? "center" : "flex-end";

  const nameSize = style.font === "script"
    ? `clamp(3rem, ${6.5 * style.size}vw, ${(4.6 * style.size).toFixed(1)}rem)`
    : style.font === "sans"
    ? `clamp(2.2rem, ${5 * style.size}vw, ${(3.6 * style.size).toFixed(1)}rem)`
    : `clamp(2.6rem, ${6 * style.size}vw, ${(4.4 * style.size).toFixed(1)}rem)`;

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100svh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: vPos,
        zIndex: 1
      }}
    >
      <motion.div
        initial={{ scale: 1.09 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, zIndex: -2 }}
      >
        {photo ? (
          <img
            src={photo.url}
            alt={name || ""}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${style.focalX}% ${style.focalY}%`,
              transform: `scale(${style.zoom})`,
              transformOrigin: `${style.focalX}% ${style.focalY}%`
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(900px 600px at 70% 20%, var(--accent-soft), transparent), linear-gradient(160deg, var(--bg-2), #000)"
            }}
          />
        )}
      </motion.div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background: `
            linear-gradient(180deg, rgba(5,4,10,${(style.overlay * 0.75).toFixed(2)}) 0%, rgba(5,4,10,0) 32%),
            radial-gradient(120% 90% at 50% 100%, rgba(5,4,10,${Math.min(0.95, style.overlay + 0.25).toFixed(2)}) 0%, rgba(5,4,10,${(style.overlay * 0.35).toFixed(2)}) 55%, rgba(5,4,10,${(style.overlay * 0.55).toFixed(2)}) 100%)
          `
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          padding: "clamp(6rem, 12vh, 9rem) clamp(1.4rem, 5vw, 4rem)",
          display: "flex",
          justifyContent: justify
        }}
      >
        <div
          style={{
            maxWidth: style.align === "center" ? "56rem" : "44rem",
            textAlign: style.align,
            textShadow: "0 2px 34px rgba(0,0,0,0.65), 0 1px 6px rgba(0,0,0,0.45)"
          }}
        >
          {config.basics.subtitle?.trim() && (
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="script"
              style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", color: COLOR_MAP[style.color] === "#fff8ee" ? "var(--accent)" : COLOR_MAP[style.color], opacity: 0.92 }}
            >
              {subtitle}
            </motion.p>
          )}
          {name && (
            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.3, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: FONT_FAMILY[style.font],
                fontWeight: style.font === "sans" ? 300 : 500,
                fontSize: nameSize,
                lineHeight: 1.08,
                color: COLOR_MAP[style.color],
                marginTop: "0.4rem"
              }}
            >
              {style.font === "serif" && (
                <>
                  for <em style={{ fontStyle: "italic" }}>{name}</em>
                </>
              )}
              {style.font !== "serif" && name}
            </motion.h1>
          )}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.95 }}
            style={{
              marginTop: "1.3rem",
              fontFamily: "var(--serif)",
              fontSize: `clamp(${(1.15 * style.size).toFixed(2)}rem, ${(2.1 * style.size).toFixed(2)}vw, ${(1.55 * style.size).toFixed(2)}rem)`,
              fontStyle: "italic",
              color: COLOR_MAP[style.color],
              opacity: 0.94,
              maxWidth: "38rem",
              marginLeft: style.align === "center" ? "auto" : undefined,
              marginRight: style.align === "center" ? "auto" : undefined
            }}
          >
            {message}
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.6rem)",
          left: 0,
          right: 0,
          display: "grid",
          placeItems: "center"
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{ display: "grid", placeItems: "center", gap: "0.3rem" }}
        >
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--muted)" }}>
            scroll
          </span>
          <ChevronDown size={16} color="var(--muted)" />
        </motion.div>
      </motion.div>
    </section>
  );
}
