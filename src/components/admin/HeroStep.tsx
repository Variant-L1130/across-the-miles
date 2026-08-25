import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { ExperienceConfig, HeroStyle } from "../../lib/types";
import { deleteMedia, processImage, uploadMedia } from "../../lib/media";
import DropZone from "./DropZone";
import { Field, Segmented, Slider } from "./fields";

export default function HeroStep({
  config,
  update
}: {
  config: ExperienceConfig;
  update: (fn: (d: ExperienceConfig) => void) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const style = config.hero.style;

  const setStyle = (patch: Partial<HeroStyle>) =>
    update((d) => Object.assign(d.hero.style, patch));

  const handleFile = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      const processed = await processImage(files[0], 2000, 640);
      const url = await uploadMedia(processed.full, `hero-${Date.now()}.jpg`, "image");
      update((d) => {
        d.hero.photo = { url, width: processed.width, height: processed.height };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!config.hero.photo ? (
        <DropZone
          accept="image/*"
          onFiles={handleFile}
          busy={busy}
          icon={<ImagePlus size={28} color="var(--accent)" />}
          label="Drop the main photograph here"
          sub="or click to browse — it becomes the cinematic hero of the experience"
        />
      ) : (
        <>
          <div
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              aspectRatio: "16/9",
              marginBottom: "1.4rem",
              border: "1px solid var(--line)"
            }}
          >
            <img
              src={config.hero.photo.url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${style.focalX}% ${style.focalY}%`,
                transform: `scale(${style.zoom})`,
                transformOrigin: `${style.focalX}% ${style.focalY}%`
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(120% 90% at 50% 100%, rgba(5,4,10,${Math.min(0.95, style.overlay + 0.25)}) 0%, rgba(5,4,10,${(style.overlay * 0.4).toFixed(2)}) 60%)`
              }}
            />
            <button
              onClick={async () => {
                await deleteMedia(config.hero.photo!.url);
                update((d) => {
                  d.hero.photo = null;
                });
              }}
              className="glass"
              aria-label="Remove photo"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(10,8,16,.65)",
                border: "1px solid var(--line)",
                color: "#ffb3b3"
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0 1.6rem" }}>
            <Slider label="Framing · horizontal" value={style.focalX} onChange={(v) => setStyle({ focalX: v })} />
            <Slider label="Framing · vertical" value={style.focalY} onChange={(v) => setStyle({ focalY: v })} />
            <Slider label="Zoom" min={100} max={180} value={Math.round(style.zoom * 100)} onChange={(v) => setStyle({ zoom: v / 100 })} format={(v) => `${v}%`} />
            <Slider label="Overlay depth" min={0} max={90} value={Math.round(style.overlay * 100)} onChange={(v) => setStyle({ overlay: v / 100 })} format={(v) => `${v}%`} />
            <Slider label="Message size" min={70} max={140} value={Math.round(style.size * 100)} onChange={(v) => setStyle({ size: v / 100 })} format={(v) => `${v}%`} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
            <Segmented
              label="Text position"
              value={style.textPos}
              options={[["top", "Top"], ["center", "Middle"], ["bottom", "Bottom"]]}
              onChange={(v) => setStyle({ textPos: v })}
            />
            <Segmented
              label="Alignment"
              value={style.align}
              options={[["left", "Left"], ["center", "Center"], ["right", "Right"]]}
              onChange={(v) => setStyle({ align: v })}
            />
            <Segmented
              label="Typeface"
              value={style.font}
              options={[["serif", "Serif"], ["script", "Script"], ["sans", "Sans"]]}
              onChange={(v) => setStyle({ font: v })}
            />
            <Field label="Text colour">
              <div style={{ display: "flex", gap: "0.7rem" }}>
                {([["ivory", "#fff8ee"], ["gold", "#f6d38b"], ["blush", "#ffd7de"]] as const).map(([k, c]) => (
                  <button
                    key={k}
                    type="button"
                    aria-label={k}
                    onClick={() => setStyle({ color: k })}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: c,
                      border: style.color === k ? "2px solid var(--accent)" : "2px solid transparent",
                      boxShadow: style.color === k ? "0 0 0 3px var(--accent-soft)" : "none",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </Field>
          </div>
        </>
      )}
      {error && <p style={{ color: "#ff9c9c", fontSize: "0.85rem" }}>{error}</p>}
    </div>
  );
}
