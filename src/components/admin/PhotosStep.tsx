import { useRef, useState } from "react";
import { Camera, ChevronDown, ChevronUp, Images, Link, Shuffle, Trash2, Unlink } from "lucide-react";
import type { ExperienceConfig } from "../../lib/types";
import { uid } from "../../lib/config";
import { deleteMedia, processImage, uploadMedia } from "../../lib/media";

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
  const singleRef = useRef<HTMLInputElement>(null);
  const multiRef = useRef<HTMLInputElement>(null);

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

  const uploadOne = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      for (const file of files) {
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

  const uploadMultiple = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length < 2) {
      setError("Select 2+ photos to create a carousel memory");
      return;
    }
    setError("");
    setBusy(true);
    const carouselId = uid();
    try {
      for (const file of imageFiles.slice(0, 40)) {
        const processed = await processImage(file);
        const [url, thumb] = await Promise.all([
          uploadMedia(processed.full, `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`, "image"),
          uploadMedia(processed.thumb, `thumb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`, "image")
        ]);
        const rot = Math.round((Math.random() * 12 - 6) * 10) / 10;
        update((d) => {
          d.photos.push({ id: uid(), url, thumb, caption: "", rot, carouselId });
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
      <input ref={singleRef} type="file" accept="image/*" multiple={false} hidden onChange={(e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) uploadOne(files);
        e.target.value = "";
      }} />
      <input ref={multiRef} type="file" accept="image/*" multiple hidden onChange={(e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) uploadMultiple(files);
        e.target.value = "";
      }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "0.8rem", marginBottom: "1rem" }}>
        <button
          type="button"
          className="glass"
          disabled={busy}
          onClick={() => singleRef.current?.click()}
          style={{
            padding: "1.6rem 1rem",
            borderStyle: "dashed",
            borderColor: "var(--line)",
            background: "rgba(255,255,255,0.03)",
            cursor: busy ? "not-allowed" : "pointer",
            textAlign: "center",
            color: "inherit",
            opacity: busy ? 0.5 : 1
          }}
        >
          <Camera size={26} color="var(--accent)" style={{ margin: "0 auto 0.5rem" }} />
          <div style={{ fontSize: "0.92rem", fontWeight: 500 }}>Add One Photo</div>
          <div style={{ fontSize: "0.74rem", color: "var(--faint)", marginTop: "0.3rem" }}>uploads a single memory</div>
        </button>
        <button
          type="button"
          className="glass"
          disabled={busy}
          onClick={() => multiRef.current?.click()}
          style={{
            padding: "1.6rem 1rem",
            borderStyle: "dashed",
            borderColor: "var(--line)",
            background: "rgba(255,255,255,0.03)",
            cursor: busy ? "not-allowed" : "pointer",
            textAlign: "center",
            color: "inherit",
            opacity: busy ? 0.5 : 1
          }}
        >
          <Images size={26} color="var(--accent)" style={{ margin: "0 auto 0.5rem" }} />
          <div style={{ fontSize: "0.92rem", fontWeight: 500 }}>Add Multiple Photos</div>
          <div style={{ fontSize: "0.74rem", color: "var(--faint)", marginTop: "0.3rem" }}>auto-groups into a swipeable carousel</div>
        </button>
      </div>

      {busy && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem", color: "var(--accent)", fontSize: "0.85rem" }}>
          <span className="spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} />
          Uploading…
        </div>
      )}
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
        Upload Multiple Photos to create a swipeable carousel. Select 2+ existing photos and click Group to combine them. Drag to reorder.
      </p>
    </div>
  );
}
