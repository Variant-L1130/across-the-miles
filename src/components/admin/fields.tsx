import type { ReactNode } from "react";
import { useId } from "react";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: "1.15rem" }}>
      <span className="field-label">{label}</span>
      {children}
      {hint && (
        <p style={{ fontSize: "0.74rem", color: "var(--faint)", marginTop: "0.4rem", lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  maxLength
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint}>
      <input
        id={id}
        className="input"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 5,
  maxLength
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div style={{ marginBottom: "1.15rem" }}>
      <span className="field-label" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        {maxLength && (
          <span style={{ opacity: 0.7 }}>
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      <textarea
        id={id}
        className="textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && (
        <p style={{ fontSize: "0.74rem", color: "var(--faint)", marginTop: "0.4rem", lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <span className="field-label" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ color: "var(--accent)" }}>{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as any]: `${((value - min) / (max - min)) * 100}%` }}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label?: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && <span className="field-label">{label}</span>}
      <div className="seg">
        {options.map(([val, lab]) => (
          <button
            key={val}
            type="button"
            className={value === val ? "active" : ""}
            onClick={() => onChange(val)}
          >
            {lab}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Card({
  children,
  title,
  desc,
  active,
  onClick,
  icon
}: {
  children?: ReactNode;
  title: string;
  desc?: string;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass"
      style={{
        textAlign: "left",
        padding: "1rem 1.1rem",
        cursor: "pointer",
        borderColor: active ? "var(--accent)" : "var(--line)",
        boxShadow: active ? "0 0 0 3px var(--accent-soft)" : "none",
        transition: "all .25s ease",
        width: "100%",
        color: "inherit",
        background: active ? "var(--accent-soft)" : undefined
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 500, fontSize: "0.95rem" }}>
        {icon}
        {title}
      </div>
      {desc && <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.35rem" }}>{desc}</p>}
      {children}
    </button>
  );
}
