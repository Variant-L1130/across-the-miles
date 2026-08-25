import { useState } from "react";
import { Camera, ChevronDown, ChevronUp, Shuffle, Trash2 } from "lucide-react";
import type { ExperienceConfig } from "../../lib/types";
import { uid } from "../../lib/config";
import { deleteMedia, processImage, uploadMedia } from "../../lib/media";
import DropZone from "./DropZone";

export default function PhotosStep({
  config,
  update
}: {
  config: ExperienceConfig;
  update: (fn: (d: ExperienceConfig) => void) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addPhotos = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      for (const file of files.slice(0, 40)) {
        if (!file.type.startsWith("image/")) continue;
        const processed = await processImage(file);
        const [url, thumb] = await Promise.all([
          uploadMedia(processed.full, `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`, "image"),
          uploadMedia(processed.thumb, `thumb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`, "image")
        ]);
        const rot = Math.round((Math.random() * 12 - 6) * 10) / 10;
        update((d) => {
          d.photos.push({ id: uid(), url, thumb, caption: "", rot });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Some photos failed to upload");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <DropZone
        multiple
        accept="image/*"
        onFiles={addPhotos}
        busy={busy}
        icon={<Camera size={28} color="var(--accent)" />}
        label={`Add memorable photos${config.photos.length ? ` (${config.photos.length} so far)` : ""}`}
        sub="they become a floating polaroid collage — drag & drop or click"
      />
      {error && <p style={{ color: "#ff9c9c", fontSize: "0.85rem", marginTop: "0.7rem" }}>{error}</p>}
      {config.photos.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", margin: "0.9rem 0" }}>
            <button
              className="btn"
              onClick={() =>
                update((d) => {
                  d.photos.forEach((p) => {
                    p.rot = Math.round((Math.random() * 14 - 7) * 10) / 10;
                  });
                })
              }
            >
              <Shuffle size={15} /> Reshuffle angles
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: "1rem" }}>
            {config.photos.map((p, i) => (
              <div key={p.id} className="glass" style={{ padding: "0.7rem" }}>
                <img
                  src={p.thumb}
                  alt=""
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    borderRadius: 8,
                    transform: `rotate(${p.rot * 0.35}deg)`
                  }}
                />
                <input
                  className="input"
                  placeholder="Caption (optional)"
                  value={p.caption}
                  maxLength={60}
                  onChange={(e) =>
                    update((d) => {
                      d.photos[i].caption = e.target.value;
                    })
                  }
                  style={{ marginTop: "0.6rem", fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.55rem" }}>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button className="btn" style={{ padding: "0.35rem 0.6rem" }} aria-label="Move up" disabled={i === 0} onClick={() => update((d) => { [d.photos[i - 1], d.photos[i]] = [d.photos[i], d.photos[i - 1]]; })}>
                      <ChevronUp size={14} />
                    </button>
                    <button className="btn" style={{ padding: "0.35rem 0.6rem" }} aria-label="Move down" disabled={i === config.photos.length - 1} onClick={() => update((d) => { [d.photos[i + 1], d.photos[i]] = [d.photos[i], d.photos[i + 1]]; })}>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "0.35rem 0.6rem" }}
                    aria-label="Remove photo"
                    onClick={async () => {
                      await deleteMedia(p.url);
                      await deleteMedia(p.thumb);
                      update((d) => {
                        d.photos.splice(i, 1);
                      });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginTop: "1rem" }}>
        Order changes how they drift into the collage; captions appear on the polaroid frames.
      </p>
    </div>
  );
}
