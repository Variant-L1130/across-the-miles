import type { ExperienceConfig } from "./types";

export async function fetchExperience(): Promise<ExperienceConfig | null> {
  const res = await fetch(`/api/experience?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  const data = await res.json();
  return (data?.config as ExperienceConfig) ?? null;
}

export async function saveExperience(config: ExperienceConfig): Promise<void> {
  const res = await fetch("/api/experience", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
}
