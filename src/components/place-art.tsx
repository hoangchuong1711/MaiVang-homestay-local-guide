"use client";
import { useState } from "react";
import { categorySymbols, type Place } from "@/lib/config";

export default function PlaceArt({ place, large = false }: { place: Place; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (place.imageUrl && !failed) return <img className={`place-photo ${large ? "large" : ""}`} src={place.imageUrl} alt={place.name} loading="lazy" onError={() => setFailed(true)} />;
  return <div className={`place-art art-${place.category.toLowerCase()} ${large ? "large" : ""}`} aria-label={`Illustration for ${place.category}; photo not yet added`} role="img">
    <svg viewBox="0 0 300 180" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <circle cx="225" cy="43" r="25" fill="#e9c878" />
      <path d="M0 102 Q65 57 130 100 T300 85 V180 H0Z" fill="#a9bd98" />
      <path d="M0 133 Q75 92 150 128 T300 108 V180 H0Z" fill="#77967b" />
      <path d="M90 180 Q225 135 161 111 Q130 97 180 91 Q149 110 190 120 Q250 148 210 180Z" fill="#cee1d9" />
      <path d="M45 144 Q58 102 51 69 M52 72 Q17 54 12 77 Q35 67 52 76 M52 72 Q75 44 91 67 Q69 63 52 77 M52 72 Q45 42 30 49 M52 72 Q76 80 76 96" fill="none" stroke="#44644d" strokeWidth="5" strokeLinecap="round" />
    </svg>
    <span className="art-icon">{categorySymbols[place.category]}</span>
    {large && <span className="art-caption">A little illustration · photo coming soon</span>}
  </div>;
}
