export interface CityRef {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Place extends CityRef {
  label?: string;
}

export interface HeroPhoto {
  url: string;
  width?: number;
  height?: number;
}

export type TextColor = "ivory" | "gold" | "blush";
export type FontChoice = "serif" | "script" | "sans";
export type VPosition = "top" | "center" | "bottom";
export type HAlign = "left" | "center" | "right";

export interface HeroStyle {
  focalX: number;
  focalY: number;
  zoom: number;
  overlay: number;
  textPos: VPosition;
  align: HAlign;
  size: number;
  color: TextColor;
  font: FontChoice;
}

export interface CollagePhoto {
  id: string;
  url: string;
  thumb: string;
  caption: string;
  rot: number;
}

export interface VideoItem {
  id: string;
  url: string;
  poster: string;
  caption: string;
}

export interface LetterCard {
  id: string;
  title: string;
  body: string;
}

export type ThemeName = "midnight" | "aurora" | "ember";

export interface ExperienceConfig {
  version: 1;
  locked: boolean;
  adminPin: string;
  theme: ThemeName;
  basics: {
    recipientName: string;
    senderName: string;
    subtitle: string;
    birthdayDate: string;
    heroMessage: string;
    introLine: string;
  };
  hero: {
    photo: HeroPhoto | null;
    style: HeroStyle;
  };
  places: {
    from: Place | null;
    to: Place | null;
  };
  journeyTagline: string;
  distanceMessage: string;
  photos: CollagePhoto[];
  videos: {
    mode: "slideshow" | "scroll";
    items: VideoItem[];
  };
  letters: LetterCard[];
  finale: {
    headline: string;
    message: string;
  };
  countdownTarget: string;
}
