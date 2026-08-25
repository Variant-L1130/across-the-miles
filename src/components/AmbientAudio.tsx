import { useCallback, useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (audioRef.current) return;
    const audio = new Audio("/ambient-song.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    audio.play().then(() => {
      const fade = setInterval(() => {
        if (audio.volume < 0.5) {
          audio.volume = Math.min(0.5, audio.volume + 0.02);
        } else {
          clearInterval(fade);
        }
      }, 80);
    }).catch(() => {
      setOn(false);
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const fade = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume -= 0.02;
      } else {
        clearInterval(fade);
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      }
    }, 40);
  }, []);

  useEffect(() => {
    const onInteract = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setOn(true);
      start();
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("touchstart", onInteract);
    window.addEventListener("scroll", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("keydown", onInteract);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [start]);

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      aria-label={on ? "Mute ambient music" : "Play ambient music"}
      title={on ? "Mute ambient music" : "Play ambient music"}
      className="glass"
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 1rem)",
        right: "1rem",
        zIndex: 60,
        width: 42,
        height: 42,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: on ? "var(--accent)" : "var(--muted)",
        border: on ? "1px solid var(--accent)" : "1px solid var(--line)"
      }}
    >
      {on ? <Music size={17} strokeWidth={1.6} /> : <VolumeX size={17} strokeWidth={1.6} />}
    </button>
  );
}
