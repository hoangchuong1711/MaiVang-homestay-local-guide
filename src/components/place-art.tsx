"use client";
import { useState } from "react";
import { categorySymbols, type Category, type Place } from "@/lib/config";

export function MaiFlower({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* 5 petals of Hoa Mai Vàng */}
      <g fill="currentColor">
        <path d="M24 4C27.5 4 30 7.2 29.2 11.5L26.5 20.5H21.5L18.8 11.5C18 7.2 20.5 4 24 4Z" />
        <path
          d="M24 4C27.5 4 30 7.2 29.2 11.5L26.5 20.5H21.5L18.8 11.5C18 7.2 20.5 4 24 4Z"
          transform="rotate(72 24 24)"
        />
        <path
          d="M24 4C27.5 4 30 7.2 29.2 11.5L26.5 20.5H21.5L18.8 11.5C18 7.2 20.5 4 24 4Z"
          transform="rotate(144 24 24)"
        />
        <path
          d="M24 4C27.5 4 30 7.2 29.2 11.5L26.5 20.5H21.5L18.8 11.5C18 7.2 20.5 4 24 4Z"
          transform="rotate(216 24 24)"
        />
        <path
          d="M24 4C27.5 4 30 7.2 29.2 11.5L26.5 20.5H21.5L18.8 11.5C18 7.2 20.5 4 24 4Z"
          transform="rotate(288 24 24)"
        />
      </g>
      <circle cx="24" cy="24" r="4.8" fill="#8c5818" />
      <circle cx="24" cy="24" r="2.3" fill="#fff6d6" />
    </svg>
  );
}

function CategorySvg({ category }: { category: Category }) {
  switch (category) {
    case "Food":
      return (
        <svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="food-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8e8cc" />
              <stop offset="55%" stopColor="#f0d3a7" />
              <stop offset="100%" stopColor="#e2b882" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#food-sky)" />
          {/* Warm lanterns & sun */}
          <circle cx="255" cy="46" r="32" fill="#e9ad4c" opacity="0.55" />
          <circle cx="64" cy="42" r="14" fill="#d4683b" opacity="0.45" />
          <line x1="64" y1="0" x2="64" y2="28" stroke="#8c4c27" strokeWidth="1.5" opacity="0.5" />
          {/* Distant river bank */}
          <path d="M0 142 Q90 116 180 136 T320 124 V200 H0Z" fill="#d1a16d" opacity="0.7" />
          <path d="M0 160 Q110 138 210 156 T320 148 V200 H0Z" fill="#b8824c" opacity="0.65" />
          {/* Ceramic Mekong bowl */}
          <path d="M96 116 C96 154 204 154 204 116 Z" fill="#4f3324" />
          <path d="M122 146 H178 L174 154 H126 Z" fill="#3a2318" />
          <ellipse cx="150" cy="116" rx="56" ry="13" fill="#fff9ed" stroke="#4f3324" strokeWidth="3.5" />
          <path d="M114 116 Q150 105 186 116" fill="none" stroke="#d97b29" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="138" cy="114" r="4.5" fill="#5e8c49" />
          <circle cx="162" cy="115" r="4" fill="#c94f32" />
          {/* Fragrant steam */}
          <path
            d="M130 95 Q123 80 133 68 M150 91 Q143 75 153 62 M170 95 Q163 80 173 68"
            fill="none"
            stroke="#fff7e6"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Chopsticks */}
          <path d="M162 76 L228 98 M166 86 L230 104" stroke="#633b22" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case "Cafe":
      return (
        <svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="cafe-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3e8d6" />
              <stop offset="100%" stopColor="#d6bfa0" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#cafe-sky)" />
          <circle cx="250" cy="48" r="30" fill="#e5b869" opacity="0.55" />
          {/* Garden foliage */}
          <path d="M0 148 Q105 118 210 140 T320 128 V200 H0Z" fill="#9fb08e" />
          <path d="M16 160 Q36 98 86 76 Q58 118 38 164 Z" fill="#4f6f4b" opacity="0.78" />
          <path d="M10 132 Q48 92 92 94" fill="none" stroke="#395436" strokeWidth="3" strokeLinecap="round" />
          <path d="M298 158 Q276 104 236 86 Q260 124 278 162 Z" fill="#5e7d58" opacity="0.65" />
          {/* Traditional Vietnamese Phin filter & glass */}
          <ellipse cx="156" cy="148" rx="44" ry="8" fill="#6b513b" opacity="0.35" />
          <rect x="130" y="96" width="52" height="48" rx="8" fill="#fffdf8" stroke="#4f3a2b" strokeWidth="3.2" />
          <rect x="135" y="114" width="42" height="25" rx="4" fill="#8c5830" opacity="0.85" />
          <path d="M182 106 H193 C201 106 201 128 193 128 H182" fill="none" stroke="#4f3a2b" strokeWidth="3.2" />
          <path d="M122 96 H190" stroke="#4f3a2b" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="136" y="76" width="40" height="20" rx="3" fill="#b89872" stroke="#4f3a2b" strokeWidth="2.8" />
          <path d="M148 76 H164" stroke="#4f3a2b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "Tour":
      return (
        <svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="tour-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7ebd0" />
              <stop offset="60%" stopColor="#dfead5" />
              <stop offset="100%" stopColor="#bad1c0" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#tour-sky)" />
          <circle cx="242" cy="44" r="28" fill="#ebb552" opacity="0.82" />
          <path d="M0 112 Q85 74 170 106 T320 94 V200 H0Z" fill="#8dad86" />
          <path d="M0 136 Q95 104 185 132 T320 118 V200 H0Z" fill="#638767" />
          {/* Winding Mekong river */}
          <path d="M50 200 Q175 150 152 114 Q134 94 186 90 Q222 118 205 150 Q192 175 248 200 Z" fill="#c7e2dc" />
          {/* Wooden Sampan & Non La conical hat */}
          <path d="M106 148 Q154 166 202 146 L186 160 Q154 170 122 160 Z" fill="#5e3d26" />
          <path d="M138 148 L154 130 L170 148 Z" fill="#e5be73" stroke="#5e3d26" strokeWidth="2" />
          <path d="M116 156 L192 156" stroke="#fff9eb" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "Essentials":
      return (
        <svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ess-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f1ebdc" />
              <stop offset="100%" stopColor="#d3dcc8" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#ess-sky)" />
          <circle cx="248" cy="46" r="24" fill="#dfb96d" opacity="0.65" />
          <path d="M0 134 Q95 104 195 128 T320 116 V200 H0Z" fill="#9fb294" />
          <rect x="116" y="88" width="76" height="54" rx="6" fill="#fffdf7" stroke="#455b47" strokeWidth="3" />
          <path d="M106 90 L154 60 L202 90 Z" fill="#c8794d" stroke="#455b47" strokeWidth="3" strokeLinejoin="round" />
          <path d="M154 102 V126 M142 114 H166" stroke="#2d5339" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case "Sightseeing":
    default:
      return (
        <svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sight-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4f2dc" />
              <stop offset="100%" stopColor="#cfe0c7" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" fill="url(#sight-sky)" />
          <circle cx="238" cy="46" r="28" fill="#eb867" style={{ fill: "#ebc46c" }} />
          <path d="M0 108 Q70 60 140 106 T320 90 V200 H0Z" fill="#9fb68e" />
          <path d="M0 140 Q80 98 160 136 T320 114 V200 H0Z" fill="#6b8e70" />
          <path d="M95 200 Q240 145 172 118 Q138 102 192 96 Q158 116 202 128 Q265 156 225 200Z" fill="#cde3db" />
          {/* Coconut palms */}
          <path
            d="M52 156 Q66 110 58 72 M59 75 Q22 56 16 80 Q40 70 59 80 M59 75 Q84 45 102 70 Q78 65 59 80 M59 75 Q52 43 35 51 M59 75 Q85 84 85 102"
            fill="none"
            stroke="#36573f"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default function PlaceArt({ place, large = false }: { place: Place; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (place.imageUrl && !failed) {
    return (
      <img
        className={`place-photo ${large ? "large" : ""}`}
        src={place.imageUrl}
        alt={place.name}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className={`place-art art-${place.category.toLowerCase()} ${large ? "large" : ""}`}
      aria-label={`Illustration for ${place.category}; photo not yet added`}
      role="img"
    >
      <CategorySvg category={place.category} />
      <span className="art-icon" aria-hidden="true">
        {categorySymbols[place.category]}
      </span>
      {large && <span className="art-caption">Mekong field illustration · photo coming soon</span>}
    </div>
  );
}
