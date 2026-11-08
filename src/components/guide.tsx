"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  Heart,
  Home,
  Languages,
  LocateFixed,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Volume2,
  Wallet,
  X,
} from "lucide-react";
import {
  categories,
  categorySymbols,
  directionsUrl,
  distanceKm,
  formatDistance,
  homestay,
  type Category,
  type Coordinates,
} from "@/lib/config";
import type { PlacesResult } from "@/lib/places";
import PlaceArt, { MaiFlower } from "./place-art";

const LocalMap = dynamic(() => import("./local-map"), {
  ssr: false,
  loading: () => (
    <div className="map-panel map-loading">
      <span className="map-spinner" />
      <span>Unfolding the Bến Tre map…</span>
    </div>
  ),
});

const phrases: Array<[english: string, vietnamese: string, phonetic: string]> = [
  ["Hello", "Xin chào", "sin chow"],
  ["Thank you", "Cảm ơn", "kahm uhn"],
  ["How much is this?", "Cái này bao nhiêu tiền?", "kai nay bow nyew tee-en?"],
  ["Not spicy, please", "Không cay, làm ơn", "kohm kai, lahm uhn"],
  ["Less sweet, please", "Ít ngọt, làm ơn", "eet ngawt, lahm uhn"],
  ["The bill, please", "Cho tôi tính tiền", "chaw toy tinh tee-en"],
  ["No meat or fish, please", "Không thịt, không cá, làm ơn", "kohm tit, kohm kah, lahm uhn"],
  ["Very delicious!", "Ngon lắm!", "ngawn lahm!"],
];

const categorySubtitles: Record<Category | "All", string> = {
  All: "Every curated spot",
  Food: "Local bowls & riverside kitchens",
  Sightseeing: "Islands, temples & heritage",
  Cafe: "Garden hammocks & coconut coffee",
  Tour: "Sampan boats & orchard trails",
  Essentials: "Markets, ATMs & pharmacies",
};

export default function Guide({
  data,
  token,
  styleUrl,
}: {
  data: PlacesResult;
  token: string;
  styleUrl: string;
}) {
  const [category, setCategory] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [modal, setModal] = useState<"place" | "phrases" | "contact" | null>(null);
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [sort, setSort] = useState<"home" | "me">("home");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [copied, setCopied] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const locationRequest = useRef(0);

  const fromMe = sort === "me" && Boolean(position);
  const origin = fromMe && position ? position : homestay;

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: data.places.length };
    for (const c of categories) map[c] = 0;
    for (const p of data.places) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [data.places]);

  const filtered = useMemo(
    () =>
      data.places
        .filter(
          (p) =>
            (category === "All" || p.category === category) &&
            `${p.name} ${p.description} ${p.category} ${p.whatToOrder || ""}`
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .includes(
                query
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .trim()
              )
        )
        .sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b)),
    [data.places, category, query, origin]
  );

  const place = data.places.find((p) => p.id === selected);

  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal();
    else if (!modal && dialog.current?.open) dialog.current.close();
    if (modal) {
      const before = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = before;
      };
    }
  }, [modal]);

  function openPlace(id: string) {
    setSelected(id);
    setModal("place");
  }

  function showOnMap(id: string) {
    setSelected(id);
    setModal(null);
    setMobileView("map");
  }

  function jumpToCategory(target: Category | "All") {
    setCategory(target);
    const el = document.getElementById("explorer-section");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  function locate() {
    if (!navigator.geolocation) {
      setLocationMessage("This browser cannot share location. Distances are shown from the homestay.");
      return;
    }
    const requestId = ++locationRequest.current;
    setLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      (result) => {
        if (requestId !== locationRequest.current) return;
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setSort("me");
        setLocating(false);
        setLocationMessage("Distances now start from your location. Your location stays private in this browser.");
      },
      (error) => {
        if (requestId !== locationRequest.current) return;
        setLocating(false);
        setLocationMessage(
          error.code === 1
            ? "Location permission was not granted. You can still explore from the homestay."
            : "We couldn’t find your location. Try again, or explore from the homestay."
        );
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  }

  async function copyPhrase(text: string, speak = false) {
    if (speak && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "vi-VN";
        utterance.rate = 0.92;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore speech synthesis errors on unsupported devices
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch {
      setCopied("Could not copy. You can show this card to someone instead.");
    }
  }

  return (
    <>
      <a className="skip-link" href="#places">
        Skip to places
      </a>

      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="/" aria-label={`${homestay.name} local guide home`}>
            <span className="brand-emblem" aria-hidden="true">
              <MaiFlower size={26} className="brand-flower-svg" />
            </span>
            <span className="brand-text">
              <strong>
                Mai Vàng<span className="brand-dot">.</span>
              </strong>
              <small>HOMESTAY · BẾN TRE</small>
            </span>
          </a>

          <nav aria-label="Main navigation">
            <a className="nav-active" href="#explorer-section">
              <Compass size={15} />
              <span>Field Guide</span>
            </a>
            <button type="button" onClick={() => setModal("phrases")}>
              <Languages size={15} />
              <span>Pocket Vietnamese</span>
            </button>
            <a href={directionsUrl(homestay)} target="_blank" rel="noreferrer">
              <Home size={15} />
              <span>Way Home</span>
            </a>
          </nav>

          <button type="button" className="host-button" onClick={() => setModal("contact")}>
            <MessageCircle size={16} />
            <span>Ask your host</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </header>

      <main>
        {/* Editorial Hero Journal */}
        <section className="hero-journal" id="explore">
          <div className="journal-topbar">
            <span>FIELD NOTES NO. 01 · MEKONG DELTA</span>
            <span className="journal-divider" aria-hidden="true">•</span>
            <span>10.2289° N, 106.3675° E</span>
            <span className="journal-divider" aria-hidden="true">•</span>
            <span>CURATED BY MAI VÀNG HOMESTAY</span>
          </div>

          <div className="hero-grid">
            <div className="intro-main">
              <p className="eyebrow">
                <span className="eyebrow-dot" /> YOUR STAY, A LITTLE MORE LOCAL
              </p>
              <h1>
                Take the slow road.
                <br />
                Find a little{" "}
                <em className="highlight-place">
                  Bến Tre.
                  <svg className="river-underline" viewBox="0 0 220 14" fill="none" aria-hidden="true">
                    <path
                      d="M3 9.5C42 2.5 82 13.5 124 6.5C158 1.5 188 10.5 217 5.5"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </em>
              </h1>
              <p className="intro-copy">
                Shaded coconut lanes, riverside kitchens, and quiet ferries across the Tiền River.
                We’ve gathered our family’s favorite corners of Bến Tre so you can wander like a neighbor, not a tourist.
              </p>

              <div className="hero-quick-moods" aria-label="Quick category shortcuts">
                <button type="button" onClick={() => jumpToCategory("Food")}>
                  <span>🍜</span> Morning Noodles & Feasts
                </button>
                <button type="button" onClick={() => jumpToCategory("Cafe")}>
                  <span>☕</span> Coconut & Garden Cafes
                </button>
                <button type="button" onClick={() => jumpToCategory("Tour")}>
                  <span>🛶</span> River & Sampan Rides
                </button>
                <button type="button" onClick={() => jumpToCategory("Sightseeing")}>
                  <span>🌿</span> Islands & Culture
                </button>
              </div>
            </div>

            <aside className="host-postcard" aria-label="A welcome postcard from your host">
              <div className="postcard-inner">
                <div className="postcard-header">
                  <div className="postcard-title-group">
                    <span className="postcard-label">CARTE POSTALE · BẾN TRE</span>
                    <span className="postcard-sub">From your host family</span>
                  </div>
                  <div className="postage-stamp" aria-hidden="true">
                    <MaiFlower size={24} />
                    <span>VIỆT NAM</span>
                  </div>
                </div>

                <blockquote className="postcard-quote">
                  “Welcome to our little corner of coconut country. Take a bicycle, follow the river breeze, and never hesitate to ask if you need a hand.”
                </blockquote>

                <div className="postcard-footer">
                  <div className="postcard-sig">
                    <Heart size={14} />
                    <span>With love, Mai Vàng</span>
                  </div>
                  <button type="button" className="postcard-cta" onClick={() => setModal("contact")}>
                    <span>Say hello</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Main Explorer Section */}
        <section className="explorer" id="explorer-section" aria-label="Local guide">
          <div className="explorer-toolbar">
            <div className="category-tabs" role="group" aria-label="Filter places by category">
              <button
                type="button"
                className={category === "All" ? "active" : ""}
                aria-pressed={category === "All"}
                onClick={() => setCategory("All")}
                title={categorySubtitles.All}
              >
                <Compass size={16} />
                <span>All places</span>
                {data.places.length > 0 && <em className="tab-count">{counts.All}</em>}
              </button>
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? "active" : ""}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  title={categorySubtitles[item]}
                >
                  <span className="tab-emoji" aria-hidden="true">
                    {categorySymbols[item]}
                  </span>
                  <span>{item}</span>
                  {data.places.length > 0 && <em className="tab-count">{counts[item]}</em>}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`location-button ${position ? "is-active" : ""}`}
              onClick={locate}
              disabled={locating}
            >
              <LocateFixed size={16} />
              <span>{locating ? "Locating…" : position ? "Update my location" : "Use my location"}</span>
            </button>
          </div>

          {locationMessage && (
            <div className="location-status" role="status">
              <LocateFixed size={15} />
              <span>{locationMessage}</span>
              <button
                type="button"
                className="status-dismiss"
                aria-label="Dismiss location notice"
                onClick={() => setLocationMessage("")}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mobile-view-tabs" role="group" aria-label="Display mode">
            <button
              type="button"
              className={mobileView === "list" ? "active" : ""}
              aria-pressed={mobileView === "list"}
              onClick={() => setMobileView("list")}
            >
              <SlidersHorizontal size={16} />
              <span>Curated List ({filtered.length})</span>
            </button>
            <button
              type="button"
              className={mobileView === "map" ? "active" : ""}
              aria-pressed={mobileView === "map"}
              onClick={() => setMobileView("map")}
            >
              <Map size={16} />
              <span>Interactive Map</span>
            </button>
          </div>

          <div className={`explorer-body view-${mobileView}`}>
            <section className="places-panel" id="places" aria-label="Recommended places">
              <div className="places-panel-header">
                <label className="search-box">
                  <Search size={17} />
                  <input
                    aria-label="Search places"
                    placeholder="Search dishes, cafes, islands…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
                      <X size={15} />
                    </button>
                  )}
                </label>

                <div className="list-heading">
                  <span aria-live="polite">
                    <strong>{filtered.length}</strong> {filtered.length === 1 ? "discovery" : "discoveries"} ·{" "}
                    <span className="list-subtitle">{categorySubtitles[category]}</span>
                  </span>
                  <label className="sort-control">
                    <ArrowDown size={13} />
                    <select
                      aria-label="Sort places by distance"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as "home" | "me")}
                    >
                      <option value="home">From homestay</option>
                      <option value="me" disabled={!position}>
                        From my location
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="place-list">
                {data.status === "error" || data.status === "unconfigured" ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <MapPin size={28} />
                    </div>
                    <h2>Our guide is taking a moment.</h2>
                    <p>
                      {data.status === "unconfigured"
                        ? "Connect the published places sheet in your local configuration to start exploring."
                        : "We couldn’t load the places right now. Please check your connection and try again."}
                    </p>
                    <button type="button" className="primary-button" onClick={() => window.location.reload()}>
                      Try again
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon-wrap">
                      <Compass size={28} />
                    </div>
                    <h2>{data.places.length ? "A little further afield?" : "Good places are on their way."}</h2>
                    <p>
                      {data.places.length
                        ? "No places match this filter yet. Try another category or ask your host for a personal recommendation."
                        : "Your host is preparing the local recommendations. You can still find your way home on the map."}
                    </p>
                    {data.places.length > 0 && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setCategory("All");
                          setQuery("");
                        }}
                      >
                        Show all places <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  filtered.map((p, index) => (
                    <article
                      key={p.id}
                      className={`place-card ${selected === p.id ? "is-selected" : ""}`}
                      onMouseEnter={() => setHovered(p.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <button
                        type="button"
                        className="place-card-main"
                        onClick={() => openPlace(p.id)}
                      >
                        <div className="card-image">
                          <PlaceArt place={p} />
                          <span className="card-number">No. {String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="card-content">
                          <div className="card-top-row">
                            <span className={`category-label label-${p.category.toLowerCase()}`}>
                              {categorySymbols[p.category]} {p.category}
                            </span>
                            <span className="card-distance">
                              <MapPin size={12} />
                              {formatDistance(distanceKm(origin, p))} {fromMe ? "from you" : "from home"}
                            </span>
                          </div>
                          <h2>{p.name}</h2>
                          <p>{p.description || "A local discovery selected by your host. Tap for full details & directions."}</p>

                          {p.whatToOrder && (
                            <div className="card-dish-strip">
                              <Utensils size={12} />
                              <span>{p.whatToOrder}</span>
                            </div>
                          )}

                          <div className="card-meta">
                            <div className="card-tags">
                              {p.priceRange && <span className="card-tag">{p.priceRange}</span>}
                              {!p.priceRange && p.openingHours && <span className="card-tag">{p.openingHours}</span>}
                              {p.tips && (
                                <span className="card-tag tag-highlight">
                                  <Sparkles size={11} /> Host tip
                                </span>
                              )}
                            </div>
                            <span className="card-arrow">
                              <span>Read note</span>
                              <ArrowUpRight size={14} />
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  ))
                )}
              </div>

              <div className="list-footnote">
                <MaiFlower size={16} />
                <span>Handpicked by Mai Vàng · Explored at your own pace.</span>
              </div>
            </section>

            <LocalMap
              places={filtered}
              selected={selected}
              hovered={hovered}
              onSelect={openPlace}
              onClearSelection={() => setSelected(null)}
              position={position}
              origin={origin}
              fromMe={fromMe}
              token={token}
              styleUrl={styleUrl}
            />
          </div>

          <p className="distance-note">
            Distances are approximate, measured in a straight line. Open Google Maps for turn-by-turn routes.
          </p>
        </section>

        {/* Bento Extras: Home Base Sanctuary + Inline Pocket Vietnamese */}
        <section className="bento-extras" aria-label="Useful things for your stay">
          <div className="sanctuary-card">
            <div className="sanctuary-watermark" aria-hidden="true">
              <MaiFlower size={180} />
            </div>
            <div className="sanctuary-top">
              <span className="sanctuary-badge">
                <Home size={14} /> YOUR HOME BASE IN BẾN TRE
              </span>
              <h2>All country roads lead back to Mai Vàng.</h2>
              <p>
                Lost down a coconut lane or ready to head back before dusk? One tap opens turn-by-turn directions straight to our gate, or message us if you need a pickup.
              </p>
            </div>
            <div className="sanctuary-actions">
              <a
                className="sanctuary-primary"
                href={directionsUrl(homestay)}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={17} />
                <span>Directions to Mai Vàng</span>
                <ArrowUpRight size={16} />
              </a>
              <button
                type="button"
                className="sanctuary-secondary"
                onClick={() => setModal("contact")}
              >
                <MessageCircle size={17} />
                <span>Contact Host</span>
              </button>
            </div>
          </div>

          <div className="pocket-vn-card">
            <div className="pocket-vn-header">
              <div>
                <span className="eyebrow">
                  <Languages size={13} /> SPEAK LIKE A NEIGHBOR
                </span>
                <h2>A little Vietnamese goes a long way.</h2>
              </div>
              <button
                type="button"
                className="pocket-vn-all"
                onClick={() => setModal("phrases")}
              >
                <span>All {phrases.length} phrases</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="pocket-vn-grid">
              {phrases.slice(0, 4).map(([english, vietnamese, phonetic]) => {
                const isCopied = copied === vietnamese;
                return (
                  <button
                    type="button"
                    key={english}
                    className={`pocket-phrase-tile ${isCopied ? "is-copied" : ""}`}
                    onClick={() => copyPhrase(vietnamese, true)}
                    aria-label={`Copy and pronounce ${vietnamese}`}
                  >
                    <div className="tile-top">
                      <small>{english}</small>
                      <span className="tile-icon">
                        {isCopied ? <Check size={14} /> : <Volume2 size={14} />}
                      </span>
                    </div>
                    <strong lang="vi">{vietnamese}</strong>
                    <em>“{phonetic}”</em>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="footer-brand">
            <MaiFlower size={20} className="footer-flower-svg" />
            <span>Crafted for slow, sun-dappled days in Bến Tre.</span>
          </span>
          <button type="button" onClick={() => setModal("contact")}>
            Need a hand? We’re right here <ArrowUpRight size={14} />
          </button>
          <small>{homestay.name} · Local Field Guide</small>
        </div>
      </footer>

      <dialog
        ref={dialog}
        className={`guide-dialog ${modal === "place" ? "place-dialog" : ""}`}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
        onClick={(event) => {
          if (event.target === dialog.current) setModal(null);
        }}
        aria-labelledby="dialog-title"
      >
        <div className="dialog-inner">
          <span className="dialog-handle" aria-hidden="true" />
          <button type="button" className="dialog-close" aria-label="Close dialog" onClick={() => setModal(null)}>
            <X size={20} />
          </button>

          {modal === "place" && place && (
            <>
              <div className="dialog-hero">
                <PlaceArt key={place.id} place={place} large />
                <span className={`dialog-category-badge label-${place.category.toLowerCase()}`}>
                  {categorySymbols[place.category]} {place.category}
                </span>
              </div>
              <div className="dialog-content">
                <h2 id="dialog-title">{place.name}</h2>
                <p className="detail-distance">
                  <MapPin size={15} />
                  <span>
                    <strong>{formatDistance(distanceKm(homestay, place))}</strong> from Mai Vàng
                    {position && (
                      <>
                        {" "}
                        · <strong>{formatDistance(distanceKm(position, place))}</strong> from you
                      </>
                    )}{" "}
                    <span className="detail-distance-sub">(straight-line estimate)</span>
                  </span>
                </p>
                <p className="detail-description">
                  {place.description || "Ask your host what makes this place special."}
                </p>

                <div className="detail-facts">
                  <div className="fact-box">
                    <Wallet size={18} />
                    <div>
                      <span>Price range</span>
                      <strong>{place.priceRange || "Ask locally"}</strong>
                    </div>
                  </div>
                  <div className="fact-box">
                    <Clock3 size={18} />
                    <div>
                      <span>Opening hours</span>
                      <strong>{place.openingHours || "Check before visiting"}</strong>
                    </div>
                  </div>
                </div>

                {place.whatToOrder && (
                  <section className="order-card">
                    <div className="order-card-header">
                      <span className="eyebrow">
                        <Utensils size={12} /> WHAT TO ORDER · SHOW TO VENDOR
                      </span>
                      <button
                        type="button"
                        className="order-copy-btn"
                        onClick={() => copyPhrase(place.whatToOrder, true)}
                      >
                        {copied === place.whatToOrder ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied === place.whatToOrder ? "Copied" : "Copy & Speak"}</span>
                      </button>
                    </div>
                    <p lang="vi">{place.whatToOrder}</p>
                    <small>Tip: Show this box directly to the person taking your order.</small>
                  </section>
                )}

                {place.tips && (
                  <section className="tip-card">
                    <span className="tip-badge" aria-hidden="true">
                      <MaiFlower size={22} />
                    </span>
                    <div>
                      <strong>A tip from your host</strong>
                      <p>{place.tips}</p>
                    </div>
                  </section>
                )}

                <div className="dialog-actions">
                  <a
                    className="primary-button directions-button"
                    href={directionsUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={18} />
                    <span>Let’s go · Google Maps</span>
                    <ArrowUpRight size={17} />
                  </a>
                  <button
                    type="button"
                    className="secondary-button map-jump-button"
                    onClick={() => showOnMap(place.id)}
                  >
                    <Map size={17} />
                    <span>View pin on map</span>
                  </button>
                </div>
                <p className="detail-note">Opens Google Maps for directions. Hours and prices may vary locally.</p>
              </div>
            </>
          )}

          {modal === "phrases" && (
            <div className="dialog-content phrases-content">
              <span className="eyebrow">
                <Languages size={13} /> CONNECT WITH A FEW WORDS
              </span>
              <h2 id="dialog-title">A little Vietnamese.</h2>
              <p className="detail-description">
                Tap any phrase to copy it and hear the pronunciation, or simply show your screen to a local vendor.
              </p>
              <div className="phrase-list">
                {phrases.map(([english, vietnamese, phonetic]) => {
                  const isCopied = copied === vietnamese;
                  return (
                    <button
                      type="button"
                      key={english}
                      className={isCopied ? "is-copied" : ""}
                      onClick={() => copyPhrase(vietnamese, true)}
                      aria-label={`Copy ${vietnamese}`}
                    >
                      <span className="phrase-text">
                        <small>{english}</small>
                        <strong lang="vi">{vietnamese}</strong>
                        <em className="phrase-phonetic">Pronounced: “{phonetic}”</em>
                      </span>
                      <span className="phrase-copy-badge">
                        {isCopied ? (
                          <>
                            <Check size={16} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={15} />
                            <Copy size={15} />
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="detail-note" role="status">
                {copied
                  ? copied.startsWith("Could not")
                    ? copied
                    : "Copied to clipboard — ready to share or show."
                  : "Tap any phrase to copy text & play audio if supported."}
              </p>
            </div>
          )}

          {modal === "contact" && (
            <div className="dialog-content contact-content">
              <span className="contact-flower" aria-hidden="true">
                <MaiFlower size={48} />
              </span>
              <span className="eyebrow">A FRIENDLY FACE, CLOSE BY</span>
              <h2 id="dialog-title">Ask your host.</h2>
              <p className="detail-description">
                Looking for a place to eat, a bicycle or sampan boat ride, or a little help finding your way back? Message Mai Vàng anytime.
              </p>
              <div className="contact-actions">
                <a className="primary-button" href={homestay.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} />
                  <span>Message on WhatsApp</span>
                  <ArrowUpRight size={17} />
                </a>
                <a className="secondary-button" href={homestay.zalo} target="_blank" rel="noreferrer">
                  <span>Open Zalo chat</span>
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <a className="phone-link" href={`tel:${homestay.phone}`}>
                Or call directly: +84 372 237 279
              </a>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
