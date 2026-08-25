import { useState } from "react";
import { Camera, ChevronDown, ChevronUp, Images, Link, Shuffle, Trash2, Unlink } from "lucide-react";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const groupSelected = () => {
    const ids = [...selected];
    if (ids.length < 2) return;
    const newGroupId = uid();
    update((d) => {
      for (const photo of d.photos) {
        if (ids.includes(photo.id)) {
          photo.carouselId = newGroupId;
        }
      }
    });
    clearSelection();
  };

  const ungroupSelected = () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    update((d) => {
      for (const photo of d.photos) {
        if (ids.includes(photo.id)) {
          delete photo.carouselId;
        }
      }
    });
    clearSelection();
  };

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

  const groupLabels = new Map<string, number>();
  for (const p of config.photos) {
    if (p.carouselId) {
      if (!groupLabels.has(p.carouselId)) groupLabels.set(p.carouselId, groupLabels.size + 1);
    }
  }

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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", margin: "0.9rem 0", flexWrap: "wrap", alignItems: "center" }}>
            {selected.size > 0 && (
              <div style={{ display: "flex", gap: "0.4rem", marginRight: "auto" }}>
                <button className="btn btn-primary" onClick={groupSelected} disabled={selected.size < 2}>
                  <Link size={14} /> Group selected ({selected.size})
                </button>
                <button className="btn" onClick={ungroupSelected}>
                  <Unlink size={14} /> Ungroup
                </button>
                <button className="btn" onClick={clearSelection}>
                  Clear
                </button>
              </div>
            )}
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
              <div
                key={p.id}
                className="glass"
                style={{
                  padding: "0.7rem",
                  borderColor: selected.has(p.id) ? "var(--accent)" : undefined,
                  outline: selected.has(p.id) ? "2px solid var(--accent)" : undefined,
                  outlineOffset: "-1px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", padding: "0.2rem 0", fontSize: "0.78rem", color: "var(--muted)" }}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      style={{ accentColor: "var(--accent)", width: 15, height: 15 }}
                    />
                    Select
                  </label>
                  {p.carouselId && (
                    <span className="carousel-badge">
                      <Images size={11} /> Carousel {groupLabels.get(p.carouselId)}
                    </span>
                  )}
                </div>
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
                        const idx = d.photos.findIndex((x) => x.id === p.id);
                        if (idx !== -1) d.photos.splice(idx, 1);
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
        Select 2+ photos and click Group to combine them into a swipeable carousel. Order changes how they drift into the collage.
      </p>
    </div>
  );
}
