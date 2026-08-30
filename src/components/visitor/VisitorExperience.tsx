import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import type { ExperienceConfig } from "../../lib/types";
import IntroGate from "./IntroGate";
import Hero from "./Hero";
import GlobeSection from "./GlobeSection";
import DistanceLetter from "./DistanceLetter";
import PhotoCollage from "./PhotoCollage";
import VideoSlideshow from "./VideoSlideshow";
import VideoScrollStory from "./VideoScrollStory";
import MemoryLetters from "./MemoryLetters";
import FinalWish from "./FinalWish";
import Countdown from "./Countdown";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 80,
        transformOrigin: "0% 50%",
        scaleX,
        background: "linear-gradient(90deg, var(--accent), var(--accent-2))"
      }}
    />
  );
}

const NAV = [
  { id: "hero", label: "For you" },
  { id: "journey", label: "A world apart" },
  { id: "apart", label: "Across the miles" },
  { id: "memories", label: "Memories" },
  { id: "videos", label: "Moving moments" },
  { id: "letters", label: "Letters" },
  { id: "finale", label: "The wish" },
  { id: "countdown", label: "Countdown" }
];

function DotNav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="fade-edge-b"
      style={{
        position: "fixed",
        right: "1.1rem",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 60,
        display: "none",
        flexDirection: "column",
        gap: "0.9rem"
      }}
      ref={(el) => {
        if (el) el.style.display = window.innerWidth > 1100 ? "flex" : "none";
      }}
    >
      {NAV.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-label={label}
          title={label}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            border: "1px solid var(--faint)",
            background: active === id ? "var(--accent)" : "transparent",
            boxShadow: active === id ? "0 0 10px var(--accent)" : "none",
            transition: "all .3s ease",
            display: "block",
            marginLeft: active === id ? 0 : "2px",
            scale: active === id ? "1.25" : "1"
          }}
        />
      ))}
    </nav>
  );
}

export default function VisitorExperience({ config }: { config: ExperienceConfig }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", config.theme);
  }, [config.theme]);

  return (
    <>
      <ScrollProgress />
      <DotNav />
      <IntroGate onBegin={() => setEntered(true)} />
      <div style={{ position: "relative", opacity: entered ? 1 : 0, transition: "opacity 1.4s ease" }}>
        <Hero config={config} />
        <GlobeSection config={config} />
        <DistanceLetter config={config} />
        <PhotoCollage photos={config.photos} />
        {(config.videos.items.length > 0) && (
          <section id="videos" style={{ position: "relative", zIndex: 1, padding: "clamp(4rem, 10vh, 8rem) 0" }}>
            <div style={{ textAlign: "center", padding: "0 1.5rem" }}>
              <span className="kicker">moments in motion</span>
              <h2 className="section-title">
                Scenes of <em>You</em>
              </h2>
            </div>
            {config.videos.mode === "slideshow" ? (
              <VideoSlideshow items={config.videos.items} />
            ) : (
              <VideoScrollStory items={config.videos.items} />
            )}
          </section>
        )}
        <MemoryLetters letters={config.letters} />
        <FinalWish config={config} />
        <Countdown config={config} />
      </div>
    </>
  );
}
