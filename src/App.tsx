import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, ShieldAlert } from "lucide-react";
import { useExperience } from "./context/ExperienceContext";
import VisitorExperience from "./components/visitor/VisitorExperience";
import AdminApp from "./components/admin/AdminApp";
import AmbientAudio from "./components/AmbientAudio";

function Splash() {
  return (
    <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", position: "relative", zIndex: 1 }}>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="script"
        style={{ fontSize: "1.8rem", color: "var(--accent)" }}
      >
        unwrapping…
      </motion.div>
    </div>
  );
}

function Welcome() {
  return (
    <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: "1.5rem", position: "relative", zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="glass"
        style={{ maxWidth: 460, padding: "2.6rem", textAlign: "center" }}
      >
        <Gift size={34} color="var(--accent)" style={{ margin: "0 auto 1rem" }} />
        <h1 className="serif" style={{ fontSize: "2rem", fontWeight: 500 }}>
          Nothing here yet
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "0.7rem", lineHeight: 1.75, fontSize: "0.95rem" }}>
          This is a birthday gift waiting to be created. Step into the studio to craft a cinematic experience for someone far away.
        </p>
        <a href="/admin" className="btn btn-primary" style={{ marginTop: "1.5rem", textDecoration: "none" }}>
          Create the gift
        </a>
      </motion.div>
    </div>
  );
}

function PreviewBanner({ onExit }: { onExit?: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        padding: "0.55rem 1rem",
        borderRadius: 999,
        fontSize: "0.78rem",
        color: "var(--muted)",
        whiteSpace: "nowrap"
      }}
      className="glass"
    >
      <ShieldAlert size={14} color="var(--accent)" />
      Preview mode — not locked yet
      <a href="/admin" className="btn" style={{ padding: "0.25rem 0.8rem", fontSize: "0.75rem", textDecoration: "none" }}>
        Open studio
      </a>
      {onExit && null}
    </div>
  );
}

export default function App() {
  const { config, loading, exists } = useExperience();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const isAdmin = path.startsWith("/admin");

  useEffect(() => {
    if (!isAdmin && !loading && exists && !config.locked) {
      document.documentElement.setAttribute("data-theme", config.theme);
    }
  }, [isAdmin, loading, exists, config.locked, config.theme]);

  if (isAdmin) {
    return (
      <>
        <AdminApp goHome={() => window.location.assign("/")} />
      </>
    );
  }

  if (loading) return <Splash />;
  if (!exists) return <Welcome />;

  return (
    <>
      <AmbientAudio />
      <VisitorExperience config={config} />
      {!config.locked && <PreviewBanner />}
    </>
  );
}
