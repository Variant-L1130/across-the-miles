import { useMemo, useRef, useState } from "react";
import { MapPin, X, Pencil } from "lucide-react";
import type { CityRef, Place } from "../../lib/types";
import { searchCities } from "../../data/cities";

export default function CityPicker({
  label,
  place,
  onChange
}: {
  label: string;
  place: Place | null;
  onChange: (p: Place | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchCities(query), [query]);

  return (
    <div style={{ marginBottom: "1.25rem" }} ref={boxRef}>
      <span className="field-label">{label}</span>
      {place ? (
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.8rem 1rem", borderRadius: 14 }}>
          <MapPin size={16} color="var(--accent)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500 }}>{place.name}</div>
            <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
              {place.country} · {place.lat.toFixed(2)}°, {place.lng.toFixed(2)}°
            </div>
          </div>
          <button
            aria-label="Edit location manually"
            onClick={() => setManual((m) => !m)}
            style={{ border: "none", background: "transparent", color: "var(--muted)", display: "grid", placeItems: "center" }}
          >
            <Pencil size={14} />
          </button>
          <button
            aria-label="Clear location"
            onClick={() => onChange(null)}
            style={{ border: "none", background: "transparent", color: "var(--muted)", display: "grid", placeItems: "center" }}
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <input
            className="input"
            placeholder="Search a city…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && results.length > 0 && (
            <div
              className="glass"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                zIndex: 30,
                maxHeight: 240,
                overflowY: "auto",
                borderRadius: 14,
                padding: "0.3rem"
              }}
            >
              {results.map((c: CityRef) => (
                <button
                  key={`${c.name}-${c.country}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange({ ...c });
                    setQuery("");
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.55rem 0.7rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: 9,
                    color: "var(--ink)",
                    fontSize: "0.9rem"
                  }}
                >
                  <span>{c.name}</span>
                  <span style={{ color: "var(--faint)", fontSize: "0.78rem" }}>{c.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {manual && place && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "0.6rem" }}>
          <input
            className="input"
            type="number"
            step="any"
            value={place.lat}
            onChange={(e) => onChange({ ...place, lat: Number(e.target.value) })}
            placeholder="Latitude"
          />
          <input
            className="input"
            type="number"
            step="any"
            value={place.lng}
            onChange={(e) => onChange({ ...place, lng: Number(e.target.value) })}
            placeholder="Longitude"
          />
        </div>
      )}
      {manual && place && (
        <p style={{ fontSize: "0.72rem", color: "var(--faint)", marginTop: "0.4rem" }}>
          Fine-tune coordinates if the pin isn’t quite right.
        </p>
      )}
    </div>
  );
}
