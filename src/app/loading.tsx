import { MaiFlower } from "@/components/place-art";

export default function Loading() {
  return (
    <main className="loading-screen">
      <span className="brand-emblem" aria-hidden="true">
        <MaiFlower size={28} />
      </span>
      <h1>A little closer to Bến Tre.</h1>
      <p>Unfolding your local field guide…</p>
    </main>
  );
}
