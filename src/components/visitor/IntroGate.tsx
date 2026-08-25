import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useExperience } from "../../context/ExperienceContext";

export default function IntroGate({ onBegin }: { onBegin: () => void }) {
  const { config } = useExperience();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("intro-seen") === "1") {
      onBegin();
      return;
    }
    document.body.classList.add("no-scroll");
    const t1 = setTimeout(() => setStage(1), 1400);
    const t2 = setTimeout(() => setStage(2), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.classList.remove("no-scroll");
    };
  }, [onBegin]);

  const begin = () => {
    sessionStorage.setItem("intro-seen", "1");
    setStage(3);
    setTimeout(() => {
      document.body.classList.remove("no-scroll");
      onBegin();
    }, 900);
  };

  const name = config.basics.recipientName || "someone special";
  const sender = config.basics.senderName;

  return (
    <AnimatePresence>
      {stage < 3 && (
        <motion.div
          key="gate"
          onClick={() => stage >= 2 && begin()}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 1.04 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            cursor: stage >= 2 ? "pointer" : "default",
            padding: "2rem"
          }}
        >
          {stage >= 1 && (
            <motion.p
              className="script"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                color: "var(--muted)",
                marginBottom: "1.2rem"
              }}
            >
              {config.basics.introLine?.trim() ||
                `a little universe${sender ? `, from ${sender}` : ", made with love"}`}
            </motion.p>
          )}
          {stage >= 1 && (
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.6em", filter: "blur(12px)" }}
              animate={{ opacity: 1, letterSpacing: "0.08em", filter: "blur(0px)" }}
              transition={{ duration: 1.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 500,
                fontSize: "clamp(2.6rem, 9vw, 5.5rem)",
                textTransform: "uppercase"
              }}
            >
              {name}
            </motion.h1>
          )}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ marginTop: "2.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    color: "var(--accent)"
                  }}
                >
                  Begin
                </span>
                <ChevronRight size={15} color="var(--accent)" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
