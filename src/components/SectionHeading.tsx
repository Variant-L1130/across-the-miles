import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import Reveal from "./Reveal";

export function Ornament() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
        justifyContent: "center",
        margin: "1.1rem auto 0"
      }}
    >
      <span
        style={{
          height: 1,
          width: "min(110px, 22vw)",
          background: "linear-gradient(90deg, transparent, var(--accent))"
        }}
      />
      <Sparkles size={15} color="var(--accent)" strokeWidth={1.5} />
      <span
        style={{
          height: 1,
          width: "min(110px, 22vw)",
          background: "linear-gradient(90deg, var(--accent), transparent)"
        }}
      />
    </div>
  );
}

export default function SectionHeading({
  kicker,
  title,
  align = "center"
}: {
  kicker?: string;
  title: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal>
      <div style={{ textAlign: align }}>
        {kicker && <span className="kicker">{kicker}</span>}
        <h2 className="section-title" style={{ marginTop: kicker ? "0.35rem" : 0 }}>
          {title}
        </h2>
        {align === "center" && <Ornament />}
      </div>
    </Reveal>
  );
}
