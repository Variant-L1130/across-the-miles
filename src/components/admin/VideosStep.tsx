import { useState } from "react";
import { ChevronDown, ChevronUp, Film, Trash2 } from "lucide-react";
import type { ExperienceConfig } from "../../lib/types";
import { uid } from "../../lib/config";
import { captureVideoPoster, deleteMedia, uploadMedia } from "../../lib/media";
import DropZone from "./DropZone";
import { Segmented } from "./fields";

export default function VideosStep({
  config,
  update
}: {
  config: ExperienceConfig;
  update: (fn: (d: ExperienceConfig) => void) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addVideos = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      for (const file of files.slice(0, 20)) {
        if (!file.type.startsWith("video/")) continue;
        if (file.size > 290 * 1024 * 1024) {
          setError(`"${file.name}" is larger than 290MB — try a shorter clip.`);
          continue;
        }
        const url = await uploadMedia(file, file.name, "video");
        let poster = "";
        try {
          const blob = await captureVideoPoster(file);
          if (blob) poster = await uploadMedia(blob, `poster-${Date.now()}.jpg`, "image");
        } catch {
          poster = "";
        }
        update((d) => {
          d.videos.items.push({ id: uid(), url, poster, caption: "" });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Some videos failed to upload");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Segmented
        label="How should the memories be experienced?"
        value={config.videos.mode}
        options={[["slideshow", "Cinematic Slideshow"], ["scroll", "Scroll Story"]]}
        onChange={(v) =>
          update((d) => {
            d.videos.mode = v;
          })
        }
      />
      <p style={{ fontSize: "0.78rem", color: "var(--faint)", marginBottom: "1.2rem", lineHeight: 1.6 }}>
        {config.videos.mode === "slideshow"
          ? "Memories play one after another on a cinematic stage with elegant controls."
          : "Each memory lives in its own chapter down the page and comes alive as the story is scrolled."}
      </p>
      <DropZone
        multiple
        accept="video/*"
        onFiles={addVideos}
        busy={busy}
        icon={<Film size={28} color="var(--accent)" />}
        label={`Add video memories${config.videos.items.length ? ` (${config.videos.items.length} so far)` : ""}`}
        sub="mp4 / webm / mov — up to ~290MB each"
      />
      {error && <p style={{ color: "#ff9c9c", fontSize: "0.85rem", marginTop: "0.7rem" }}>{error}</p>}
      {config.videos.items.length > 0 && (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.2rem" }}>
          {config.videos.items.map((v, i) => (
            <div key={v.id} className="glass" style={{ padding: "0.7rem", display: "flex", gap: "0.9rem", alignItems: "center" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {v.poster ? (
                  <img src={v.poster} alt="" style={{ width: 120, aspectRatio: "16/9", objectFit: "cover", borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 120, aspectRatio: "16/9", borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", color: "var(--faint)", fontSize: "0.65rem" }}>
                    no preview
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  className="input"
                  placeholder="Caption for this memory"
                  value={v.caption}
                  maxLength={70}
                  onChange={(e) =>
                    update((d) => {
                      d.videos.items[i].caption = e.target.value;
                    })
                  }
                  style={{ fontSize: "0.88rem", padding: "0.5rem 0.75rem" }}
                />
                <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem" }}>
                  <button className="btn" style={{ padding: "0.35rem 0.6rem" }} aria-label="Move up" disabled={i === 0} onClick={() => update((d) => { [d.videos.items[i - 1], d.videos.items[i]] = [d.videos.items[i], d.videos.items[i - 1]]; })}>
                    <ChevronUp size={14} />
                  </button>
                  <button className="btn" style={{ padding: "0.35rem 0.6rem" }} aria-label="Move down" disabled={i === config.videos.items.length - 1} onClick={() => update((d) => { [d.videos.items[i + 1], d.videos.items[i]] = [d.videos.items[i], d.videos.items[i + 1]]; })}>
                    <ChevronDown size={14} />
                  </button>
                  <span style={{ color: "var(--faint)", fontSize: "0.72rem", alignSelf: "center", marginLeft: "0.4rem" }}>
                    memory {i + 1}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ padding: "0.45rem 0.6rem", flexShrink: 0 }}
                aria-label="Remove video"
                onClick={async () => {
                  await deleteMedia(v.url);
                  if (v.poster) await deleteMedia(v.poster);
                  update((d) => {
                    d.videos.items.splice(i, 1);
                  });
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
