import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  Film,
  Globe2,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  Lock,
  Mail,
  PartyPopper,
  PenLine,
  Plus,
  ShieldCheck,
  Trash2,
  Unlock
} from "lucide-react";
import { useExperience } from "../../context/ExperienceContext";
import type { ExperienceConfig, ThemeName } from "../../lib/types";
import { uid } from "../../lib/config";
import { haversineMiles, formatNumber } from "../../lib/geo";
import CityPicker from "./CityPicker";
import LivePreview from "./LivePreview";
import HeroStep from "./HeroStep";
import PhotosStep from "./PhotosStep";
import ReviewPhotoStep from "./ReviewPhotoStep";
import VideosStep from "./VideosStep";
import { Card, Field, TextArea, TextField } from "./fields";

const STEPS = [
  { id: "basics", label: "The Basics", icon: <Heart size={15} /> },
  { id: "hero", label: "Hero Photo", icon: <ImageIcon size={15} /> },
  { id: "journey", label: "Locations", icon: <Globe2 size={15} /> },
  { id: "apart", label: "Distance Message", icon: <Mail size={15} /> },
  { id: "photos", label: "Photo Memories", icon: <Camera size={15} /> },
  { id: "videos", label: "Video Memories", icon: <Film size={15} /> },
  { id: "letters", label: "Little Letters", icon: <PenLine size={15} /> },
  { id: "finale", label: "Finale & Countdown", icon: <CalendarDays size={15} /> },
  { id: "reviewphoto", label: "Review Photo", icon: <ImagePlus size={15} /> },
  { id: "review", label: "Review & Lock", icon: <Lock size={15} /> }
];

const THEMES: [ThemeName, string, string, string][] = [
  ["midnight", "Midnight Rose", "deep indigo skies, rose-gold stars", "linear-gradient(135deg,#0d0c1a,#f0b6c6,#b9a7f5)"],
  ["aurora", "Aurora", "northern lights over a quiet sea", "linear-gradient(135deg,#081218,#8ff0d4,#9db8ff)"],
  ["ember", "Golden Hour", "warm dusk light, soft amber glow", "linear-gradient(135deg,#150e0a,#f5c98a,#ff9d9d)"]
];

function SaveBadge() {
  const { saveState } = useExperience();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: saveState === "error" ? "#ff9c9c" : saveState === "saving" ? "var(--muted)" : "var(--accent)" }}>
      {saveState === "saving" && "Saving…"}
      {saveState === "saved" && (<><CheckCircle2 size={13} /> Saved</>)}
      {saveState === "idle" && "All changes saved automatically"}
      {saveState === "error" && (<><AlertCircle size={13} /> Server offline — is `npm run dev` running?</>)}
    </span>
  );
}

function StepShell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{ padding: "clamp(1.3rem, 3vw, 2.2rem)" }}
    >
      <h2 className="serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 500 }}>{title}</h2>
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginTop: "0.3rem", marginBottom: "1.6rem" }}>{desc}</p>
      {children}
    </motion.div>
  );
}

function BasicsStep({ config, update }: { config: ExperienceConfig; update: any }) {
  return (
    <>
      <TextField label="Birthday person’s name *" value={config.basics.recipientName} onChange={(v) => update((d: ExperienceConfig) => { d.basics.recipientName = v; })} placeholder="e.g. Aanya" maxLength={40} />
      <TextField label="Your name (the sender)" value={config.basics.senderName} onChange={(v) => update((d: ExperienceConfig) => { d.basics.senderName = v; })} placeholder="e.g. Rohan" maxLength={40} />
      <TextField
        label="A short subtitle / relationship line"
        value={config.basics.subtitle}
        onChange={(v) => update((d: ExperienceConfig) => { d.basics.subtitle = v; })}
        placeholder="your best friend since forever · my favourite person"
        hint="Appears in delicate script above their name on the hero."
        maxLength={80}
      />
      <Field label="The birthday being celebrated">
        <input
          type="date"
          className="input"
          value={config.basics.birthdayDate}
          onChange={(e) => update((d: ExperienceConfig) => {
            d.basics.birthdayDate = e.target.value;
            if (!d.countdownTarget) d.countdownTarget = `${e.target.value}T00:00`;
          })}
          style={{ maxWidth: 240 }}
        />
      </Field>
      <TextArea
        label="Personalised birthday message (over the hero photo)"
        value={config.basics.heroMessage}
        onChange={(v) => update((d: ExperienceConfig) => { d.basics.heroMessage = v; })}
        rows={4}
        maxLength={400}
      />
      <TextField label="Intro whisper (before the reveal)" value={config.basics.introLine} onChange={(v) => update((d: ExperienceConfig) => { d.basics.introLine = v; })} placeholder="a little universe, made only for you" maxLength={90} />
      <Field label="Atmosphere">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,180px),1fr))", gap: "0.8rem" }}>
          {THEMES.map(([id, name, desc, grad]) => (
            <Card key={id} title={name} desc={desc} active={config.theme === id} onClick={() => update((d: ExperienceConfig) => { d.theme = id; })}>
              <div aria-hidden style={{ height: 34, borderRadius: 10, background: grad, marginTop: "0.7rem", opacity: 0.85 }} />
            </Card>
          ))}
        </div>
      </Field>
      <p style={{ fontSize: "0.76rem", color: "var(--faint)", lineHeight: 1.7 }}>
        Tip — in any message you can use magical tokens: {"{Name}"} {"{Sender}"} {"{Date}"} {"{From}"} {"{To}"} {"{Miles}"}.
      </p>
    </>
  );
}

function JourneyStep({ config, update }: { config: ExperienceConfig; update: any }) {
  const miles = useMemo(
    () => (config.places.from && config.places.to ? haversineMiles(config.places.from, config.places.to) : null),
    [config.places]
  );
  return (
    <>
      <CityPicker label="You are in…" place={config.places.from} onChange={(p) => update((d: ExperienceConfig) => { d.places.from = p; })} />
      <CityPicker label={`${config.basics.recipientName || "They"} are in…`} place={config.places.to} onChange={(p) => update((d: ExperienceConfig) => { d.places.to = p; })} />
      {miles !== null && (
        <motion.div
          key={Math.round(miles)}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass"
          style={{ textAlign: "center", padding: "1rem", borderRadius: 16, marginBottom: "1.4rem" }}
        >
          <span className="script" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>≈ {formatNumber(miles)} miles apart</span>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--faint)", marginTop: 2 }}>calculated across the curved earth</span>
        </motion.div>
      )}
      <TextField
        label="Tagline under the globe"
        value={config.journeyTagline}
        onChange={(v) => update((d: ExperienceConfig) => { d.journeyTagline = v; })}
        hint="{Miles}, {From}, {To} tokens work here."
        maxLength={140}
      />
    </>
  );
}

function LettersStep({ config, update }: { config: ExperienceConfig; update: any }) {
  return (
    <>
      <div style={{ display: "grid", gap: "1rem" }}>
        {config.letters.map((l, i) => (
          <div key={l.id} className="glass" style={{ padding: "1rem" }}>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <input
                className="input"
                placeholder="Letter title"
                value={l.title}
                maxLength={60}
                onChange={(e) => update((d: ExperienceConfig) => { d.letters[i].title = e.target.value; })}
                style={{ flex: 1, fontSize: "0.92rem" }}
              />
              <button
                className="btn btn-danger"
                aria-label="Remove letter"
                onClick={() => update((d: ExperienceConfig) => { d.letters.splice(i, 1); })}
                style={{ padding: "0.55rem 0.7rem" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              className="textarea"
              placeholder="Write something personal…"
              rows={4}
              value={l.body}
              maxLength={1200}
              onChange={(e) => update((d: ExperienceConfig) => { d.letters[i].body = e.target.value; })}
              style={{ marginTop: "0.6rem", fontSize: "0.92rem" }}
            />
          </div>
        ))}
      </div>
      <button className="btn" onClick={() => update((d: ExperienceConfig) => { d.letters.push({ id: uid(), title: "", body: "" }); })}>
        <Plus size={15} /> Add another letter
      </button>
    </>
  );
}

function FinaleStep({ config, update }: { config: ExperienceConfig; update: any }) {
  return (
    <>
      <TextField label="Final headline" value={config.finale.headline} onChange={(v) => update((d: ExperienceConfig) => { d.finale.headline = v; })} hint="{Name} becomes their name." maxLength={120} />
      <TextArea label="Final message" value={config.finale.message} onChange={(v) => update((d: ExperienceConfig) => { d.finale.message = v; })} rows={4} maxLength={600} />
      <Field label="Countdown target — the exact moment to celebrate *" hint="Shown as the very last element of the page, ticking down years → seconds, then celebrating when it reaches zero.">
        <input
          type="datetime-local"
          className="input"
          value={config.countdownTarget}
          max="9999-12-31T23:59"
          onChange={(e) => update((d: ExperienceConfig) => { d.countdownTarget = e.target.value; })}
          style={{ maxWidth: 300 }}
        />
      </Field>
    </>
  );
}

function ReviewStep({
  config,
  onLock,
  locking
}: {
  config: ExperienceConfig;
  onLock: (pin: string) => void;
  locking: boolean;
}) {
  const [pin, setPin] = useState("");
  const [confirming, setConfirming] = useState(false);
  const checks = [
    ["Their name is set", !!config.basics.recipientName.trim()],
    ["Birthday date chosen", !!config.basics.birthdayDate],
    ["Main photograph uploaded", !!config.hero.photo],
    ["Both locations selected", !!config.places.from && !!config.places.to],
    ["Countdown moment set", !!config.countdownTarget],
    ["At least a touch of magic (any content)", config.photos.length + config.videos.items.length > 0 || !!config.distanceMessage.trim()]
  ] as [string, boolean][];
  const ready = checks.every(([, ok]) => ok);

  return (
    <>
      <div style={{ display: "grid", gap: "0.55rem", marginBottom: "1.6rem" }}>
        {checks.map(([label, ok]) => (
          <div key={label} style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.92rem", color: ok ? "var(--ink)" : "#ff9c9c" }}>
            {ok ? <CheckCircle2 size={16} color="var(--accent)" /> : <AlertCircle size={16} />}
            {label}
          </div>
        ))}
      </div>
      <div className="glass" style={{ padding: "1rem 1.2rem", borderRadius: 14, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "1.4rem" }}>
        <strong style={{ color: "var(--ink)" }}>{config.basics.recipientName || "—"}</strong> ·{" "}
        {config.basics.birthdayDate || "date not set"}<br />
        {config.places.from ? `${config.places.from.name}` : "?"} → {config.places.to ? `${config.places.to.name}` : "?"}
        {milesLabel(config)}<br />
        {config.photos.length} photos · {config.videos.items.length} videos ({config.videos.mode}) · {config.letters.length} letters<br />
        Countdown to {config.countdownTarget || "— not set —"}
      </div>
      <Field label="Optional admin PIN" hint="If set, unlocking this experience later for edits requires the PIN. Keep it somewhere safe.">
        <input className="input" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="4–6 digits" inputMode="numeric" style={{ maxWidth: 200 }} />
      </Field>
      <button className="btn btn-primary" disabled={!ready || locking} onClick={() => setConfirming(true)}>
        <Lock size={15} /> Lock Birthday Experience
      </button>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !locking && setConfirming(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 70,
              background: "rgba(4,3,9,0.75)",
              backdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
              padding: "1.5rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 430, width: "100%", padding: "1.8rem", textAlign: "center" }}
            >
              <ShieldCheck size={30} color="var(--accent)" style={{ margin: "0 auto 0.8rem" }} />
              <h3 className="serif" style={{ fontSize: "1.5rem", fontWeight: 500 }}>Ready to make it real?</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.94rem", marginTop: "0.7rem", lineHeight: 1.7 }}>
                Once you lock this experience, the birthday setup will become read-only for visitors. Are you sure you want to continue?
              </p>
              <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", marginTop: "1.4rem", flexWrap: "wrap" }}>
                <button className="btn" onClick={() => setConfirming(false)} disabled={locking}>Keep editing</button>
                <button className="btn btn-primary" disabled={locking} onClick={() => onLock(pin)}>
                  {locking ? "Locking…" : (<><Lock size={15} /> Lock it with love</>)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function milesLabel(config: ExperienceConfig) {
  if (config.places.from && config.places.to) {
    return ` · ≈${formatNumber(haversineMiles(config.places.from, config.places.to))} mi`;
  }
  return "";
}

function LockedScreen({ onUnlock, unlocking }: { onUnlock: (pin: string) => void; unlocking: boolean }) {
  const { config } = useExperience();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  return (
    <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "1.5rem", position: "relative", zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ maxWidth: 420, width: "100%", padding: "2.2rem", textAlign: "center" }}>
        <PartyPopper size={30} color="var(--accent)" style={{ margin: "0 auto 0.9rem" }} />
        <h1 className="serif" style={{ fontSize: "1.8rem", fontWeight: 500 }}>
          The gift is wrapped
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginTop: "0.6rem", lineHeight: 1.7 }}>
          {config.basics.recipientName ? `Everything is ready for ${config.basics.recipientName}.` : "This experience is locked."} Visitors see the finished story at the main address.
        </p>
        <a href="/" className="btn btn-primary" style={{ marginTop: "1.4rem", textDecoration: "none" }}>
          Open the experience <ExternalLink size={14} />
        </a>
        <div style={{ marginTop: "1.8rem", paddingTop: "1.4rem", borderTop: "1px solid var(--line)" }}>
          {config.adminPin ? (
            <>
              <span className="field-label">Admin PIN required to edit again</span>
              <input
                className="input"
                value={pin}
                inputMode="numeric"
                placeholder="PIN"
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ maxWidth: 160, margin: "0 auto 0.6rem", textAlign: "center", letterSpacing: "0.4em" }}
              />
              {err && <p style={{ color: "#ff9c9c", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{err}</p>}
              <button
                className="btn"
                disabled={unlocking || pin.length < 4}
                onClick={() => {
                  let expected = config.adminPin;
                  try {
                    expected = atob(config.adminPin).replace(/^atm:/, "");
                  } catch {
                    expected = config.adminPin;
                  }
                  if (pin !== expected) {
                    setErr("That PIN doesn’t match.");
                    return;
                  }
                  onUnlock(pin);
                }}
              >
                <Unlock size={14} /> Unlock to edit
              </button>
            </>
          ) : (
            <button className="btn" disabled={unlocking} onClick={() => onUnlock("")}>
              <Unlock size={14} /> Unlock to edit
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminApp({ goHome }: { goHome: () => void }) {
  const { config, loading, update, flush } = useExperience();
  const [step, setStep] = useState(0);
  const [locking, setLocking] = useState(false);
  const [justLocked, setJustLocked] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", color: "var(--faint)", letterSpacing: "0.2em", fontSize: "0.8rem", textTransform: "uppercase" }}>
        unwrapping…
      </div>
    );
  }

  if (config.locked) {
    return (
      <LockedScreen
        unlocking={false}
        onUnlock={() => {
          update((d) => {
            d.locked = false;
          });
        }}
      />
    );
  }

  if (justLocked) {
    return (
      <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "1.5rem", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="glass" style={{ maxWidth: 460, padding: "2.6rem", textAlign: "center" }}>
          <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, delay: 0.3 }} style={{ display: "inline-block" }}>
            <Check size={44} color="var(--accent)" />
          </motion.div>
          <h1 className="serif" style={{ fontSize: "2rem", fontWeight: 500, marginTop: "0.8rem" }}>Sealed with love</h1>
          <p style={{ color: "var(--muted)", marginTop: "0.7rem", lineHeight: 1.75, fontSize: "0.94rem" }}>
            The experience is now read-only for visitors. Share the main localhost address — they’ll walk straight into the finished gift, no forms, no setup.
          </p>
          <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", marginTop: "1.6rem", flexWrap: "wrap" }}>
            <a href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>Open the experience</a>
            <button className="btn" onClick={() => setJustLocked(false)}>Back to studio</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const current = STEPS[step];
  const showPreview = window.innerWidth > 1420 && current.id !== "review";

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <header className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderRadius: 0, borderInline: "none", borderTop: "none", padding: "0.85rem clamp(1rem, 4vw, 2.4rem)", display: "flex", alignItems: "center", gap: "1rem", backdropFilter: "blur(20px)" }}>
        <span className="script" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>Across the Miles</span>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--faint)", border: "1px solid var(--line)", padding: "0.25rem 0.6rem", borderRadius: 99 }}>studio</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <SaveBadge />
          <a href="/" className="btn" style={{ padding: "0.45rem 1rem", textDecoration: "none" }}>View site</a>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: "2.4rem", padding: "clamp(1rem, 3vw, 2.4rem)", maxWidth: 1600, margin: "0 auto", width: "100%" }}>
        <nav aria-label="Setup steps" style={{ width: 190, flexShrink: 0, display: window.innerWidth > 900 ? "block" : "none" }}>
          <div style={{ position: "sticky", top: 84, display: "grid", gap: "0.2rem" }}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 12,
                  border: "none",
                  background: i === step ? "var(--accent-soft)" : "transparent",
                  color: i === step ? "var(--ink)" : "var(--muted)",
                  fontSize: "0.86rem",
                  textAlign: "left",
                  boxShadow: i === step ? "inset 0 0 0 1px var(--accent)" : "none",
                  transition: "all .25s ease"
                }}
              >
                <span style={{ color: i === step ? "var(--accent)" : "var(--faint)", display: "grid" }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <main style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
          <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.9rem", marginBottom: "0.4rem" }}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                aria-label={s.label}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 26 : 8,
                  height: 8,
                  minWidth: 8,
                  borderRadius: 99,
                  border: "none",
                  background: i === step ? "var(--accent)" : "rgba(255,255,255,0.18)",
                  cursor: "pointer",
                  transition: "all .3s ease"
                }}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <div key={current.id}>
              {current.id === "basics" && (
                <StepShell title="Begin with the heart of it" desc="Who is this for, who is it from, and what should the sky say?">
                  <BasicsStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "hero" && (
                <StepShell title="The hero photograph" desc="One picture worth a thousand missed sunsets. Frame it like a film still.">
                  <HeroStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "journey" && (
                <StepShell title="Two cities, one thread" desc="Pick where you each are — the globe will draw the line between your hearts.">
                  <JourneyStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "apart" && (
                <StepShell title="Across the distance" desc="The words that live between the miles. Say what distance can’t measure.">
                  <TextArea
                    label=""
                    value={config.distanceMessage}
                    onChange={(v) => update((d: ExperienceConfig) => { d.distanceMessage = v; })}
                    rows={7}
                    maxLength={900}
                  />
                  <p className="script" style={{ fontSize: "1.35rem", color: "var(--accent)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    “{config.distanceMessage.slice(0, 220)}{config.distanceMessage.length > 220 ? "…" : ""}”
                  </p>
                </StepShell>
              )}
              {current.id === "photos" && (
                <StepShell title="A pocketful of moments" desc="The photographs that tell your story — they’ll float into a polaroid constellation.">
                  <PhotosStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "videos" && (
                <StepShell title="Scenes in motion" desc="Moving memories, and how they should be experienced.">
                  <VideosStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "letters" && (
                <StepShell title="Little letters" desc="Small notes that become keepsake cards near the end of the journey.">
                  <LettersStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "finale" && (
                <StepShell title="The last word & the wait" desc="Your final wish, and the exact second the celebration begins.">
                  <FinaleStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "reviewphoto" && (
                <StepShell title="A closing photo" desc="One image to round off the journey — a single framed memory at the end.">
                  <ReviewPhotoStep config={config} update={update} />
                </StepShell>
              )}
              {current.id === "review" && (
                <StepShell title="Almost theirs" desc="One last look before it becomes read-only forever.">
                  <ReviewStep
                    config={config}
                    locking={locking}
                    onLock={async (pin) => {
                      setLocking(true);
                      try {
                        await flush();
                      } catch {}
                      update((d) => {
                        d.adminPin = pin ? btoa(`atm:${pin}`) : "";
                        d.locked = true;
                      });
                      await flush();
                      setLocking(false);
                      setJustLocked(true);
                    }}
                  />
                </StepShell>
              )}
            </div>
          </AnimatePresence>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.4rem", gap: "0.8rem" }}>
            <button className="btn" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              <ArrowLeft size={15} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <span style={{ color: "var(--faint)", fontSize: "0.82rem", alignSelf: "center" }}>the final step</span>
            )}
          </div>
        </main>

        {showPreview && <LivePreview config={config} />}
      </div>
    </div>
  );
}
