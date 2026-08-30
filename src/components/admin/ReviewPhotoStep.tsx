import { useRef, useState } from "react";
import { Camera, ImageIcon, Trash2 } from "lucide-react";
import type { ExperienceConfig } from "../../lib/types";
import { deleteMedia, processImage, uploadMedia } from "../../lib/media";

export default function ReviewStep({
  config,
  update
}: {
  config: ExperienceConfig;
  update: (fn: (d: ExperienceConfig) => void) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError("");
    setBusy(true);
    try {
      const processed = await processImage(file, 1800, 900);
      const url = await uploadMedia(processed.full, `review-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`, "image");
      if (config.review.photo?.url) {
        await deleteMedia(config.review.photo.url);
      }
      update((d) => {
        d.review.photo = { url, width: processed.width, height: processed.height };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (config.review.photo?.url) {
      await deleteMedia(config.review.photo.url);
    }
    update((d) => {
      d.review.photo = null;
    });
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) upload(f);
        e.target.value = "";
      }} />

      {config.review.photo ? (
        <div className="glass" style={{ padding: "1rem", maxWidth: 360 }}>
          <img
            src={config.review.photo.url}
            alt="Review photo"
            style={{ width: "100%", borderRadius: 12, display: "block" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", justifyContent: "flex-end" }}>
            <button className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
              <ImageIcon size={14} /> Replace
            </button>
            <button className="btn btn-danger" disabled={busy} onClick={remove}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="glass"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "2.2rem 1rem",
            borderStyle: "dashed",
            borderColor: "var(--line)",
            background: "rgba(255,255,255,0.03)",
            cursor: busy ? "not-allowed" : "pointer",
            textAlign: "center",
            color: "inherit",
            opacity: busy ? 0.5 : 1
          }}
        >
          <Camera size={28} color="var(--accent)" style={{ margin: "0 auto 0.6rem" }} />
          <div style={{ fontSize: "0.92rem", fontWeight: 500 }}>Upload the review photo</div>
          <div style={{ fontSize: "0.74rem", color: "var(--faint)", marginTop: "0.3rem" }}>a single closing image, shown at the end</div>
        </button>
      )}
      {error && <p style={{ color: "#ff9c9c", fontSize: "0.85rem", marginTop: "0.7rem" }}>{error}</p>}
      <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: "0.9rem" }}>
        This appears as a framed closing image at the very end of the visitor experience. You can change it anytime.
      </p>
    </div>
  );
}
