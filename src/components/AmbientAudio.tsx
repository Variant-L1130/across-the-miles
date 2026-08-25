import { useCallback, useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ master: GainNode; stop: () => void } | null>(null);

  const start = useCallback(() => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 3);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 640;
    filter.Q.value = 0.4;
    filter.connect(master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const pads = [110, 164.81, 220, 277.18];
    const padOscs = pads.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = i % 2 === 0 ? -3 : 4;
      const g = ctx.createGain();
      g.gain.value = i < 2 ? 0.2 : 0.09;
      o.connect(g).connect(filter);
      o.start();
      return { o, g };
    });

    const scale = [220, 246.94, 277.18, 329.63, 370, 440, 493.88, 554.37];
    let pluckTimer: ReturnType<typeof setTimeout>;
    const pluck = () => {
      if (!ctxRef.current) return;
      const t = ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)] * (Math.random() > 0.7 ? 2 : 1);
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.055, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      const pan = ctx.createStereoPanner?.() ?? null;
      if (pan) {
        pan.pan.value = Math.random() * 1.2 - 0.6;
        o.connect(g).connect(pan).connect(master);
      } else {
        o.connect(g).connect(master);
      }
      o.start(t);
      o.stop(t + 2.5);
      pluckTimer = setTimeout(pluck, 2400 + Math.random() * 2600);
    };
    pluckTimer = setTimeout(pluck, 1500);

    nodesRef.current = {
      master,
      stop: () => {
        clearTimeout(pluckTimer);
        try {
          lfo.stop();
          padOscs.forEach(({ o }) => o.stop());
        } catch {
          /* already stopped */
        }
        void ctx.close();
      }
    };
  }, []);

  const toggle = () => {
    if (on) {
      nodesRef.current?.stop();
      nodesRef.current = null;
      ctxRef.current = null;
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  };

  useEffect(() => {
    return () => {
      nodesRef.current?.stop();
    };
  }, []);

  return (
    <button
      onClick={toggle}
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
