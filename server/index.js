import express from "express";
import multer from "multer";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "server", "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const CONFIG_FILE = path.join(DATA_DIR, "experience.json");
const DIST_DIR = path.join(ROOT, "dist");

const PORT = Number(process.env.PORT || 5178);
const HOST = process.env.HOST || "0.0.0.0";

for (const d of [DATA_DIR, UPLOAD_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "6mb" }));

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/ogg": ".ogv"
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase() || ".bin";
    cb(null, `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }
});

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeConfig(config) {
  const tmp = CONFIG_FILE + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(config, null, 2), "utf8");
  await fsp.rename(tmp, CONFIG_FILE);
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/experience", (_req, res) => {
  res.json({ config: readConfig() });
});

app.put("/api/experience", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Invalid config payload" });
    }
    await writeConfig(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Could not save experience" });
  }
});

app.post("/api/media", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });
  res.json({
    url: `/media/${req.file.filename}`,
    name: req.file.originalname,
    size: req.file.size
  });
});

app.delete("/api/media/:name", async (req, res) => {
  const name = String(req.params.name || "");
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return res.status(400).json({ error: "Bad name" });
  try {
    await fsp.unlink(path.join(UPLOAD_DIR, name));
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

app.use(
  "/media",
  express.static(UPLOAD_DIR, {
    immutable: true,
    maxAge: "365d",
    acceptRanges: true
  })
);

if (fs.existsSync(DIST_DIR)) {
  app.use(
    express.static(DIST_DIR, {
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      }
    })
  );
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/media/")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("  ──────────────────────────────────────────────");
  console.log("   A Gift Across the Miles");
  console.log(`   Experience + admin →  http://localhost:${PORT}`);
  console.log(`                       →  http://localhost:${PORT}/admin`);
  console.log(`   Data folder        →  ${DATA_DIR}`);
  console.log("  ──────────────────────────────────────────────");
  console.log("");
});
