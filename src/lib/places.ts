import Papa from "papaparse";
import { categories, type Category, type Place } from "./config";

// Exact source-text translations for the initial Sheet. New/edited text is preserved.
const translations: Record<string, string> = {
  "Cù lao trên sông Tiền, thích hợp tham quan cảnh sông nước Bến Tre.": "An island on the Tiền River, a lovely spot to discover Bến Tre’s riverside scenery.",
  "Khu du lịch sinh thái có trò chơi vận động, hoạt động nhóm và nhà hàng.": "An outdoor recreation area with active games, group activities and a restaurant.",
  "Điểm tham quan tìm hiểu lịch sử và văn hóa địa phương, gần sông Bến Tre.": "Discover local history and culture at this museum near the Bến Tre River.",
  "Chợ trung tâm để xem sản vật địa phương và mua đồ dùng hằng ngày.": "Explore local produce and pick up everyday essentials at Bến Tre’s central market.",
};

export function imageUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    if (url.hostname === "res.cloudinary.com") {
      // The initial Sheet contains demo/sample.jpg, not photographs of these places.
      if (url.pathname.startsWith("/demo/")) return "";
      return raw.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_900,c_limit/");
    }
    return raw;
  } catch { return ""; }
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
    const description = get("description");
    places.push({ id, name, category: category as Category, lat, lng,
      description: translations[description] || description,
      whatToOrder: get("what_to_order"), priceRange: get("price_range"),
      openingHours: get("opening_hours"), tips: get("tips"), imageUrl: imageUrl(get("image_url")),
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
      next: { revalidate: 3600 }, signal: AbortSignal.timeout(15000),
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
