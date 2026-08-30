import type { ExperienceConfig } from "./types";

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function defaultConfig(): ExperienceConfig {
  return {
    version: 1,
    locked: false,
    adminPin: "",
    theme: "midnight",
    basics: {
      recipientName: "",
      senderName: "",
      subtitle: "",
      birthdayDate: "",
      heroMessage: "Even from oceans away, you are the closest thing to my heart. Today the whole sky celebrates you.",
      introLine: "a little universe, made only for you"
    },
    hero: {
      photo: null,
      style: {
        focalX: 50,
        focalY: 35,
        zoom: 1,
        overlay: 0.55,
        textPos: "bottom",
        align: "center",
        size: 1,
        color: "ivory",
        font: "serif"
      }
    },
    places: {
      from: null,
      to: null
    },
    journeyTagline: "{Miles} miles apart, but never far from my heart.",
    distanceMessage:
      "Miles may separate us, oceans may lie between us, and different skies may be above us — but none of that can measure how close you are to my heart. No matter where in the world you are, today is a reminder that you are loved, remembered, and celebrated.",
    photos: [],
    videos: {
      mode: "slideshow",
      items: []
    },
    letters: [
      {
        id: uid(),
        title: "A small note",
        body:
          "Save your favourite memories, inside jokes, or promises here. You can add as many little letters as you like — each one becomes a card in the story."
      }
    ],
    finale: {
      headline: "Happy Birthday, {Name}.",
      message:
        "Wherever life takes you, I hope you always remember how deeply you are loved."
    },
    review: {
      photo: null
    },
    countdownTarget: ""
  };
}

export function interpolate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : m
  );
}

export function deepMergeConfig(saved: unknown): ExperienceConfig {
  const base = defaultConfig();
  if (!saved || typeof saved !== "object") return base;
  const s = saved as Record<string, any>;
  return {
    ...base,
    ...s,
    basics: { ...base.basics, ...(s.basics || {}) },
    hero: {
      ...base.hero,
      ...(s.hero || {}),
      style: { ...base.hero.style, ...((s.hero && s.hero.style) || {}) },
      photo: s.hero?.photo ?? null
    },
    places: { from: s.places?.from ?? null, to: s.places?.to ?? null },
    videos: {
      mode: s.videos?.mode === "scroll" ? "scroll" : "slideshow",
      items: Array.isArray(s.videos?.items) ? s.videos.items : []
    },
    photos: Array.isArray(s.photos) ? s.photos : [],
    letters: Array.isArray(s.letters)
      ? s.letters.filter((l: any) => l && typeof l === "object")
      : [],
    finale: { ...base.finale, ...(s.finale || {}) },
    review: {
      photo: s.review?.photo ?? null
    }
  } as ExperienceConfig;
}
