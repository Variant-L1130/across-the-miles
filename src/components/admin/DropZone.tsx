import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export default function DropZone({
  multiple,
  accept,
  onFiles,
  busy,
  icon,
  label,
  sub
}: {
  multiple?: boolean;
  accept: string;
  onFiles: (files: File[]) => void;
  busy?: boolean;
  icon: ReactNode;
  label: string;
  sub?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length) onFiles(files);
      }}
      className="glass"
      style={{
        width: "100%",
        padding: "2rem 1rem",
        borderStyle: "dashed",
        borderColor: over ? "var(--accent)" : "var(--line)",
        background: over ? "var(--accent-soft)" : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        textAlign: "center",
        color: "inherit"
      }}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <div style={{ display: "grid", placeItems: "center", gap: "0.5rem", opacity: busy ? 0.5 : 1 }}>
        {busy ? <Loader2 size={26} className="spin" color="var(--accent)" /> : icon}
        <div style={{ fontSize: "0.92rem" }}>{label}</div>
        {sub && <div style={{ fontSize: "0.74rem", color: "var(--faint)" }}>{sub}</div>}
      </div>
    </button>
  );
}
