# A Gift Across the Miles

A cinematic, interactive birthday-gift experience for someone celebrating far from home — a personalized digital present rather than a website. The recipient scrolls through an emotional journey: a reveal of their name, their photograph with your words over it, a living globe connecting two cities, the memories in photos and video, personal letters, a final wish under floating embers, and a real-time countdown to the moment you celebrate.

## Quick start

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**

- First visit → a welcome screen with **Create the gift** (the studio).
- Everything you type/upload is saved automatically to disk as you go.
- When everything is ready, open **Review & Lock** and press **Lock Birthday Experience**.
- From then on, anyone who opens **http://localhost:5173** sees only the finished experience — no forms, no setup, no admin UI.

### Production-style run (optional)

```bash
npm run build
npm start          # serves the built app + API on http://localhost:5178
```

## The studio (`/admin`)

A guided, autosaving setup flow:

1. **The Basics** — names, relationship line, birthday date, hero message, intro whisper, atmosphere palette (Midnight Rose / Aurora / Golden Hour).
2. **Hero Photo** — upload the main photograph; control framing, zoom, overlay depth, text position/alignment/typeface/colour/size.
3. **Locations** — pick both cities; distance is calculated across the curved earth; editable tagline.
4. **Distance Message** — the long letter between the miles (fully replaceable).
5. **Photo Memories** — upload many photos; captions, ordering, reshuffle angles. They become a floating polaroid collage with parallax and a lightbox.
6. **Video Memories** — upload clips, caption and order them, choose *Cinematic Slideshow* or *Scroll Story*.
7. **Little Letters** — as many keepsake note cards as you like.
8. **Finale & Countdown** — final headline + wish, and the exact countdown moment (years → seconds).
9. **Review & Lock** — checklist, optional admin PIN, confirmation dialog, lock.

Messages support tokens: `{Name}` `{Sender}` `{Date}` `{From}` `{To}` `{Miles}`.

On wide screens a live phone preview follows along as you design.

## Where data lives

- `server/data/experience.json` — the whole configuration.
- `server/data/uploads/` — every photo/video/poster.

This is what makes the gift survive refreshes and appear identically for anyone opening the same localhost URL. Delete these files to start over. To swap in a real backend later, only `src/lib/api.ts` needs to change — the UI never talks to storage directly.

## Admin access after locking

Go to `/admin`. If you set a PIN before locking, it is required to unlock and edit again.

## Deploying for someone in another country

Localhost (and tunnels) only work while your Mac runs. For a permanent link anyone can open worldwide:

### Railway (recommended — persistent volume on every plan)

1. Push this folder to a GitHub repo.
2. On [railway.app](https://railway.app): **New Project → Deploy from GitHub repo**, pick the repo. `railway.json` drives build/start automatically.
3. In your service → **Volumes** → **New Volume**, mount path **`/data`**.
4. Service → **Variables** → add `DATA_DIR` = `/data`.
5. **Settings → Networking → Generate Domain** to get your public URL.

Every gift photo/video/message then lives on that volume and survives redeploys.

### Render (alternative)

1. Push to GitHub. On [render.com](https://render.com): **New → Blueprint**, point at the repo — `render.yaml` defines the web service plus a 1 GB disk mounted at `/data`.
2. Note: persistent disks require a paid instance type (Starter).

### Notes

- The server respects `PORT` and binds `0.0.0.0`; data goes to `$DATA_DIR` (defaults to `server/data/` locally).
- Platform proxies may cap upload sizes below the app's 300 MB limit — keep video clips roughly under 100 MB when uploading through a deployed URL.
- Set an admin PIN before locking on a public URL, since `/admin` is reachable by anyone who guesses it.

## Notes

- Images are resized/compressed in the browser before upload; videos get auto-generated poster frames.
- Animations respect `prefers-reduced-motion`; canvases pause when the tab is hidden.
- Ambient generative music is off by default — the small button top-right enables it.
- Port conflicts: dev web runs on 5173, API on 5178 (both configurable via `PORT`).
