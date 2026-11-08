import Guide from "@/components/guide";
import { getPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getPlaces();
  return <Guide data={data} token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""} styleUrl={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/outdoors-v12"} />;
}
