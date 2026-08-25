export interface PlaceLike {
  lat: number;
  lng: number;
}

const R_MILES = 3958.7612;
const R_KM = 6371.0088;

const rad = (d: number) => (d * Math.PI) / 180;

export function haversineMiles(a: PlaceLike, b: PlaceLike): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_MILES * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function milesToKm(miles: number): number {
  return (miles / R_MILES) * R_KM;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}
