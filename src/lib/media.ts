export interface ProcessedImage {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

async function loadBitmap(file: File | Blob): Promise<{
  draw: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if ("createImageBitmap" in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        draw: bmp,
        width: bmp.width,
        height: bmp.height,
        cleanup: () => bmp.close()
      };
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = url;
  });
  return {
    draw: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    cleanup: () => URL.revokeObjectURL(url)
  };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
      "image/jpeg",
      quality
    )
  );
}

export async function processImage(
  file: File,
  maxSize = 1800,
  thumbMax = 520
): Promise<ProcessedImage> {
  const src = await loadBitmap(file);
  try {
    const scale = Math.min(1, maxSize / Math.max(src.width, src.height));
    const w = Math.max(1, Math.round(src.width * scale));
    const h = Math.max(1, Math.round(src.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src.draw, 0, 0, w, h);
    const full = await toBlob(canvas, 0.85);

    const tScale = Math.min(1, thumbMax / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * tScale));
    const th = Math.max(1, Math.round(h * tScale));
    const tc = document.createElement("canvas");
    tc.width = tw;
    tc.height = th;
    const tctx = tc.getContext("2d")!;
    tctx.imageSmoothingQuality = "high";
    tctx.drawImage(src.draw, 0, 0, tw, th);
    const thumb = await toBlob(tc, 0.8);

    return { full, thumb, width: w, height: h };
  } finally {
    src.cleanup();
  }
}

export async function captureVideoPoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    const finish = (blob: Blob | null) => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    const timer = window.setTimeout(() => finish(null), 6000);
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.4, video.duration * 0.1 || 0.1);
      } catch {
        window.clearTimeout(timer);
        finish(null);
      }
    };
    video.onseeked = () => {
      window.clearTimeout(timer);
      try {
        const scale = Math.min(1, 720 / Math.max(video.videoWidth || 720, 1));
        const w = Math.max(2, Math.round((video.videoWidth || 640) * scale));
        const h = Math.max(2, Math.round((video.videoHeight || 360) * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d")!.drawImage(video, 0, 0, w, h);
        c.toBlob((b) => finish(b), "image/jpeg", 0.78);
      } catch {
        finish(null);
      }
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };
  });
}

export async function uploadMedia(
  blob: Blob,
  filename: string,
  kind: string
): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, filename);
  fd.append("kind", kind);
  const res = await fetch("/api/media", { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const data = await res.json();
  return data.url as string;
}

export async function deleteMedia(nameOrUrl: string): Promise<void> {
  const name = nameOrUrl.split("/").pop() || "";
  if (!name) return;
  try {
    await fetch(`/api/media/${encodeURIComponent(name)}`, { method: "DELETE" });
  } catch {
    /* non-fatal */
  }
}
