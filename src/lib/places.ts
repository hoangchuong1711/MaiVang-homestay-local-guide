import Papa from "papaparse";
import { categories, type Category, type Place } from "./config";

export function imageUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    if (url.hostname === "res.cloudinary.com") {
      // The initial Sheet contains demo/sample.jpg, not photographs of these places.
      if (url.pathname.startsWith("/demo/")) return "";
    }
    return url.href;
  } catch { return ""; }
}

export function googleMapUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:") return "";
    if (host === "maps.app.goo.gl" || (host === "goo.gl" && url.pathname.startsWith("/maps"))) return raw;
    if ((host === "google.com" || host === "www.google.com") && url.pathname.startsWith("/maps")) return raw;
    if (host === "maps.google.com") return raw;
    return "";
  } catch { return ""; }
}

function optionalNumber(raw: string): number | null {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function parsePlaces(csv: string): { places: Place[]; skipped: number } {
  if (/^\s*</.test(csv)) throw new Error("Expected CSV, received HTML");
  const parsed = Papa.parse<Record<string, string>>(csv.replace(/^\uFEFF/, ""), {
    header: true, skipEmptyLines: "greedy", transformHeader: (h) => h.trim(),
  });
  const required = ["id", "name", "category", "lat", "lng"];
  if (!required.every((key) => parsed.meta.fields?.includes(key))) throw new Error("Missing required CSV columns");
  if (parsed.errors.some((e) => e.type === "Quotes")) throw new Error("Malformed CSV quotes");
  const invalidRows = new Set(parsed.errors.filter((e) => typeof e.row === "number").map((e) => e.row));
  const seen = new Set<string>();
  const places: Place[] = [];
  let skipped = 0;
  parsed.data.forEach((row, index) => {
    const get = (key: string) => (row[key] || "").trim().normalize("NFC");
    const id = get("id"), name = get("name"), category = get("category");
    const lat = Number(get("lat")), lng = Number(get("lng"));
    if (invalidRows.has(index) || !id || !name || seen.has(id) || !categories.includes(category as Category)
      || !get("lat") || !get("lng") || !Number.isFinite(lat) || !Number.isFinite(lng)
      || Math.abs(lat) > 90 || Math.abs(lng) > 180) { skipped++; return; }
    seen.add(id);
    places.push({ id, name, category: category as Category, lat, lng,
      description: get("description"),
      whatToOrder: get("what_to_order"), priceRange: get("price_range"),
      openingHours: get("opening_hours"), closingHours: get("closing_hours"),
      tips: get("tips"), imageUrl: imageUrl(get("image_url")),
      googleMapUrl: googleMapUrl(get("google_map_url")),
      illusX: optionalNumber(get("illus_x")), illusY: optionalNumber(get("illus_y")),
    });
  });
  return { places, skipped };
}

export type PlacesResult = { places: Place[]; status: "ready" | "empty" | "error" | "unconfigured"; skipped: number };

export async function getPlaces(): Promise<PlacesResult> {
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL;
  if (!rawUrl) return { places: [], status: "unconfigured", skipped: 0 };
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" || url.hostname !== "docs.google.com" || url.searchParams.get("output") !== "csv") {
      throw new Error("Invalid published Sheet URL");
    }
    const response = await fetch(url, {
      cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Sheet request failed");
    const csv = await response.text();
    if (csv.length > 2_000_000) throw new Error("Sheet is too large");
    const result = parsePlaces(csv);
    return { ...result, status: result.places.length ? "ready" : "empty" };
  } catch {
    // Do not log source URLs, credentials, or upstream error bodies.
    console.warn("Place data unavailable. Check the published CSV configuration or connection.");
    return { places: [], status: "error", skipped: 0 };
  }
}
