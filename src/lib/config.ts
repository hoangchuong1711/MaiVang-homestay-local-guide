export const homestay = {
  name: "Mai Vàng Homestay",
  region: "Bến Tre, Vietnam",
  lat: 10.228855,
  lng: 106.3675106,
  phone: "+84372237278",
  whatsapp: "https://wa.me/84372237278",
  instagram: "https://www.instagram.com/maivanghomestay?vrfl=cG4xOG54ZHc3c3k2",
};

export const categories = ["Food", "Sightseeing", "Cafe", "Tour", "Essentials"] as const;
export type Category = (typeof categories)[number];
export type Coordinates = { lat: number; lng: number };
export type Place = Coordinates & {
  id: string;
  name: string;
  category: Category;
  description: string;
  whatToOrder: string;
  priceRange: string;
  openingHours: string;
  closingHours: string;
  tips: string;
  imageUrl: string;
  googleMapUrl: string;
  illusX: number | null;
  illusY: number | null;
};

export const categorySymbols: Record<Category, string> = {
  Food: "🍜", Sightseeing: "🌿", Cafe: "☕", Tour: "🛶", Essentials: "✚",
};

export function distanceKm(a: Coordinates, b: Coordinates) {
  const radians = (n: number) => n * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function directionsUrl(point: Coordinates & { googleMapUrl?: string }) {
  if (point.googleMapUrl) return point.googleMapUrl;
  return `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
}
