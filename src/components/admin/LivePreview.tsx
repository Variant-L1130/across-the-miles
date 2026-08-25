import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ExperienceConfig } from "../../lib/types";
import { haversineMiles, formatNumber } from "../../lib/geo";
import { interpolate } from "../../lib/config";

function MiniHero({ config }: { config: ExperienceConfig }) {
  const s = config.hero.style;
  return (
    <div style={{ position: "relative", height: 300, overflow: "hidden", background: "#000" }}>
      {config.hero.photo && (
        <img
          src={config.hero.photo.url}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${s.focalX}% ${s.focalY}%`,
            transform: `scale(${s.zoom})`,
            transformOrigin: `${s.focalX}% ${s.focalY}%`
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 90% at 50% 100%, rgba(5,4,10,${Math.min(0.95, s.overlay + 0.25)}) 0%, rgba(5,4,10,${(s.overlay * 0.4).toFixed(2)}) 60%)`,
          display: "flex",
          alignItems: s.textPos === "top" ? "flex-start" : s.textPos === "center" ? "center" : "flex-end",
          justifyContent: "center",
          padding: "1rem"
        }}
      >
        <div style={{ textAlign: s.align, paddingBottom: s.textPos === "bottom" ? "1.2rem" : 0 }}>
          <span className="script" style={{ fontSize: 15, color: "var(--accent)" }}>
            {config.basics.subtitle || "for you"}
          </span>
          <div
            className={s.font}
            style={{
              fontSize: s.font === "script" ? 30 : 24,
              color: "#fff8ee",
              lineHeight: 1.15,
              textShadow: "0 2px 18px rgba(0,0,0,.7)"
            }}
          >
            {s.font === "serif" ? (
              <>
                for <em>{config.basics.recipientName || "…"}</em>
              </>
            ) : (
              config.basics.recipientName || "…"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LivePreview({ config }: { config: ExperienceConfig }) {
  const miles = useMemo(
    () => (config.places.from && config.places.to ? haversineMiles(config.places.from, config.places.to) : null),
    [config.places]
  );
  const tagline = interpolate(config.journeyTagline, {
    Miles: miles !== null ? formatNumber(miles) : "…",
    From: config.places.from?.name ?? "",
    To: config.places.to?.name ?? "",
    Name: config.basics.recipientName,
    Sender: config.basics.senderName,
    Date: config.basics.birthdayDate
  });

  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Live preview"
      style={{
        width: 330,
        flexShrink: 0,
        position: "sticky",
        top: 90,
        alignSelf: "flex-start"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "0.6rem", letterSpacing: "0.3em", fontSize: "0.62rem", textTransform: "uppercase", color: "var(--faint)" }}>
        live preview
      </div>
      <div
        className="glass"
        style={{
          borderRadius: "38px",
          padding: 10,
          boxShadow: "var(--shadow)",
          background: "rgba(255,255,255,0.06)"
        }}
      >
        <div
          style={{
            borderRadius: 29,
            overflow: "hidden",
            height: 600,
            overflowY: "auto",
            pointerEvents: "none",
            background: "var(--bg)",
            scrollbarWidth: "none"
          }}
        >
          <MiniHero config={config} />
          <div style={{ padding: "1.4rem 1rem", textAlign: "center" }}>
            <span className="kicker" style={{ fontSize: 13 }}>two points on one small planet</span>
            <div className="serif" style={{ fontSize: 19, marginTop: 4 }}>A World <em>Apart</em></div>
            {miles !== null && (
              <div className="glass tabular serif" style={{ margin: "0.8rem auto 0", padding: "0.45rem 1rem", borderRadius: 99, display: "inline-block", fontSize: 15 }}>
                ≈ {formatNumber(miles)} mi · {tagline}
              </div>
            )}
            <p className="script" style={{ color: "var(--accent)", fontSize: 16, marginTop: "1rem", whiteSpace: "pre-wrap" }}>
              “{config.distanceMessage.slice(0, 130)}
              {config.distanceMessage.length > 130 ? "…”" : "”"}
            </p>
          </div>
          {config.photos.length > 0 && (
            <div style={{ padding: "0 1rem 1.4rem", textAlign: "center" }}>
              <div className="serif" style={{ fontSize: 18, marginBottom: 12 }}>
                The <em>Memories</em>
              </div>
              <div style={{ position: "relative", height: 150 }}>
                {config.photos.slice(0, 6).map((p, i) => (
                  <img
                    key={p.id}
                    src={p.thumb}
                    alt=""
                    style={{
                      position: "absolute",
                      left: `${8 + i * 14}%`,
                      top: `${i % 2 === 0 ? 6 : 26}%`,
                      width: 92,
                      transform: `rotate(${p.rot}deg)`,
                      border: "4px solid #faf6ef",
                      borderRadius: 4,
                      boxShadow: "0 8px 20px rgba(0,0,0,.45)"
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {config.videos.items[0] && (
            <div style={{ padding: "0 1rem 1.4rem" }}>
              <img src={config.videos.items[0].poster} alt="" style={{ width: "100%", borderRadius: 10, aspectRatio: "16/9", objectFit: "cover", border: "1px solid var(--line)" }} />
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--faint)" }}>
                {config.videos.mode === "slideshow" ? "cinematic slideshow" : "scroll story"} · {config.videos.items.length} clips
              </div>
            </div>
          )}
          <div style={{ padding: "0 1rem 2rem", textAlign: "center" }}>
            <p className="serif" style={{ fontSize: 17, marginTop: "0.6rem" }}>{interpolate(config.finale.headline, { Name: config.basics.recipientName || "…" })}</p>
            <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>{config.finale.message}</p>
            <div className="glass" style={{ marginTop: "1.1rem", padding: "0.7rem 0.4rem", borderRadius: 14 }}>
              <div className="serif tabular" style={{ fontSize: 16 }}>
                00 · 00 · 00 · 00
              </div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "var(--faint)", marginTop: 2 }}>UNTIL WE CELEBRATE</div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
