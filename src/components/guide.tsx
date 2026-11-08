"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, Compass, Copy, Heart, Home, Languages, LocateFixed, Map, MapPin, MessageCircle, Navigation, Search, SlidersHorizontal, Wallet, X } from "lucide-react";
import { categories, categorySymbols, directionsUrl, distanceKm, formatDistance, homestay, type Category, type Coordinates, type Place } from "@/lib/config";
import type { PlacesResult } from "@/lib/places";
import PlaceArt from "./place-art";

const LocalMap = dynamic(() => import("./local-map"), { ssr: false, loading: () => <div className="map-panel map-loading">Opening the map…</div> });
const phrases = [
  ["Hello", "Xin chào"], ["Thank you", "Cảm ơn"], ["How much is this?", "Cái này bao nhiêu tiền?"],
  ["Not spicy, please", "Không cay, làm ơn"], ["The bill, please", "Cho tôi tính tiền"],
  ["No meat or fish, please", "Không thịt, không cá, làm ơn"],
];

export default function Guide({ data, token, styleUrl }: { data: PlacesResult; token: string; styleUrl: string }) {
  const [category, setCategory] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<"place" | "phrases" | "contact" | null>(null);
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [sort, setSort] = useState<"home" | "me">("home");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [copied, setCopied] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const locationRequest = useRef(0);
  const origin = sort === "me" && position ? position : homestay;
  const filtered = useMemo(() => data.places.filter((p) => (category === "All" || p.category === category)
    && `${p.name} ${p.description} ${p.category}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .includes(query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()))
    .sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b)), [data.places, category, query, origin]);
  const place = data.places.find((p) => p.id === selected);

  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal();
    else if (!modal && dialog.current?.open) dialog.current.close();
    if (modal) { const before = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = before; }; }
  }, [modal]);

  function openPlace(id: string) { setSelected(id); setModal("place"); }
  function locate() {
    if (!navigator.geolocation) { setLocationMessage("This browser cannot share location. Distances are shown from the homestay."); return; }
    const requestId = ++locationRequest.current;
    setLocating(true); setLocationMessage("");
    navigator.geolocation.getCurrentPosition((result) => {
      if (requestId !== locationRequest.current) return;
      setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
      setSort("me"); setLocating(false); setLocationMessage("Distances now start from your location. Your location stays in this browser.");
    }, (error) => {
      if (requestId !== locationRequest.current) return;
      setLocating(false);
      setLocationMessage(error.code === 1 ? "Location permission was not granted. You can still explore from the homestay." : "We couldn’t find your location. Try again, or explore from the homestay.");
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
  }

  async function copyPhrase(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(text); }
    catch { setCopied("Could not copy. You can show this card to someone instead."); }
  }

  return <>
    <a className="skip-link" href="#places">Skip to places</a>
    <header className="site-header">
      <a className="brand" href="/" aria-label={`${homestay.name} local guide home`}><span className="brand-flower">✳</span><span><strong>Mai Vàng<span className="brand-dot">.</span></strong><small>HOMSTAY · BẾN TRE</small></span></a>
      <nav aria-label="Main navigation"><a className="nav-active" href="#explore">Explore the area</a><button onClick={() => setModal("phrases")}>A little Vietnamese</button></nav>
      <button className="host-button" onClick={() => setModal("contact")}><MessageCircle size={16} /><span>Ask your host</span><ArrowUpRight size={15} /></button>
    </header>

    <main>
      <section className="intro" id="explore">
        <div><p className="eyebrow"><span /> YOUR STAY, A LITTLE MORE LOCAL</p><h1>Take the slow road.<br />Find a little <em>Bến Tre.</em></h1><p className="intro-copy">Our corner of the Mekong, shared with you.<br className="desktop-break" /> Places to wander, tastes to try, and everyday little discoveries.</p></div>
        <div className="host-note"><span className="note-sun">✳</span><p>Welcome to our<br />little corner of home.</p><span className="note-signature">With love, Mai Vàng</span><Heart size={17} /></div>
      </section>

      <section className="explorer" aria-label="Local guide">
        <div className="explorer-toolbar">
          <div className="category-tabs" role="group" aria-label="Filter places by category">
            <button className={category === "All" ? "active" : ""} aria-pressed={category === "All"} onClick={() => setCategory("All")}><Compass size={16} /> All places</button>
            {categories.map((item) => <button key={item} className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}><span aria-hidden="true">{categorySymbols[item]}</span>{item}</button>)}
          </div>
          <button className="location-button" onClick={locate} disabled={locating}><LocateFixed size={17} />{locating ? "Locating…" : position ? "Update my location" : "Use my location"}</button>
        </div>
        {locationMessage && <p className="location-status" role="status">{locationMessage}</p>}
        <div className="mobile-view-tabs" role="group" aria-label="Display mode"><button className={mobileView === "list" ? "active" : ""} aria-pressed={mobileView === "list"} onClick={() => setMobileView("list")}><SlidersHorizontal size={16} /> List</button><button className={mobileView === "map" ? "active" : ""} aria-pressed={mobileView === "map"} onClick={() => setMobileView("map")}><Map size={16} /> Map</button></div>
        <div className={`explorer-body view-${mobileView}`}>
          <section className="places-panel" id="places" aria-label="Recommended places">
            <label className="search-box"><Search size={17} /><input aria-label="Search places" placeholder="Find your next little discovery…" value={query} onChange={(e) => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}</label>
            <div className="list-heading"><span aria-live="polite"><strong>{filtered.length}</strong> places to explore</span><label><ArrowDown size={12} /><select aria-label="Sort places by distance" value={sort} onChange={(e) => setSort(e.target.value as "home" | "me")}><option value="home">Nearest to home</option><option value="me" disabled={!position}>Nearest to me</option></select></label></div>
            <div className="place-list">
              {data.status === "error" || data.status === "unconfigured" ? <div className="empty-state"><MapPin size={30} /><h2>Our guide is taking a moment.</h2><p>{data.status === "unconfigured" ? "Connect the published places sheet to start exploring." : "We couldn’t load the places. Please check your connection and try again."}</p><button className="primary-button" onClick={() => window.location.reload()}>Try again</button></div>
              : filtered.length === 0 ? <div className="empty-state"><Compass size={32} /><h2>{data.places.length ? "A little further afield?" : "Good places are on their way."}</h2><p>{data.places.length ? "No places match this search yet. Try another category or ask your host for a recommendation." : "Your host is preparing the local recommendations. You can still find your way home on the map."}</p>{data.places.length > 0 && <button className="text-button" onClick={() => { setCategory("All"); setQuery(""); }}>Show all places <ArrowRight size={16} /></button>}</div>
              : filtered.map((p, index) => <button key={p.id} className={`place-card ${selected === p.id ? "is-selected" : ""}`} onClick={() => openPlace(p.id)}>
                <div className="card-image"><PlaceArt place={p} /><span className="card-number">{String(index + 1).padStart(2, "0")}</span></div>
                <div className="card-content"><span className={`category-label label-${p.category.toLowerCase()}`}>{p.category}</span><h2>{p.name}</h2><p>{p.description || "A local discovery selected by your host. Open for details."}</p><div className="card-meta"><span><MapPin size={12} />{formatDistance(distanceKm(origin, p))} {sort === "me" && position ? "from you" : "from home"}</span><span className="card-arrow"><ArrowUpRight size={16} /></span></div></div>
              </button>)}
            </div>
            <div className="list-footnote"><Heart size={13} /><span>Picked by your host, explored at your pace.</span></div>
          </section>
          <LocalMap places={filtered} selected={selected} onSelect={openPlace} position={position} token={token} styleUrl={styleUrl} />
        </div>
        <p className="distance-note">Distances are approximate, in a straight line. Open Google Maps for your actual route.</p>
      </section>

      <section className="little-extras" aria-label="Useful things for your stay">
        <a className="extra-card home-extra" href={directionsUrl(homestay)} target="_blank" rel="noreferrer"><span className="extra-icon"><Home size={22} /></span><div><span className="eyebrow">YOUR HOME BASE</span><h2>All roads lead to Mai Vàng.</h2><p>One tap to find your way back.</p></div><ArrowUpRight size={22} /></a>
        <button className="extra-card phrase-extra" onClick={() => setModal("phrases")}><span className="extra-icon"><Languages size={23} /></span><div><span className="eyebrow">A FEW WORDS GO A LONG WAY</span><h2>A little Vietnamese?</h2><p>Small phrases. Big smiles.</p></div><ChevronRight size={22} /></button>
      </section>
    </main>

    <footer className="site-footer"><span><span className="footer-flower">✳</span> Made for slow days in Bến Tre.</span><button onClick={() => setModal("contact")}>Need a hand? We’re here. <ArrowUpRight size={14} /></button><small>{homestay.name} · Local guide</small></footer>

    <dialog ref={dialog} className={`guide-dialog ${modal === "place" ? "place-dialog" : ""}`} onCancel={() => setModal(null)} onClose={() => setModal(null)} onClick={(event) => { if (event.target === dialog.current) setModal(null); }} aria-labelledby="dialog-title">
      <div className="dialog-inner"><button className="dialog-close" aria-label="Close dialog" onClick={() => setModal(null)}><X size={20} /></button>
      {modal === "place" && place && <>
        <PlaceArt key={place.id} place={place} large />
        <div className="dialog-content"><span className="eyebrow">{categorySymbols[place.category]} {place.category}</span><h2 id="dialog-title">{place.name}</h2><p className="detail-distance"><MapPin size={15} />{formatDistance(distanceKm(homestay, place))} from Mai Vàng · straight-line estimate</p><p className="detail-description">{place.description || "Ask your host what makes this place special."}</p>
        <div className="detail-facts"><div><Wallet size={18} /><span>Price<strong>{place.priceRange || "Ask locally"}</strong></span></div><div><Clock3 size={18} /><span>Opening hours<strong>{place.openingHours || "Check before visiting"}</strong></span></div></div>
        {place.whatToOrder && <section className="order-card"><span className="eyebrow">WHAT TO ORDER</span><p>{place.whatToOrder}</p><small>Show this to the person taking your order.</small></section>}
        {place.tips && <section className="tip-card"><span>✳</span><div><strong>A tip from your host</strong><p>{place.tips}</p></div></section>}
        <a className="primary-button directions-button" href={directionsUrl(place)} target="_blank" rel="noreferrer"><Navigation size={18} />Let’s go · Google Maps<ArrowUpRight size={17} /></a><p className="detail-note">Opens Google Maps for directions. Hours and prices may change.</p></div>
      </>}
      {modal === "phrases" && <div className="dialog-content phrases-content"><span className="eyebrow">CONNECT WITH A FEW WORDS</span><h2 id="dialog-title">A little Vietnamese.</h2><p className="detail-description">Try saying it, or simply show your screen. A smile helps, too.</p><div className="phrase-list">{phrases.map(([english, vietnamese]) => <button key={english} onClick={() => copyPhrase(vietnamese)} aria-label={`Copy ${vietnamese}`}><span><small>{english}</small><strong lang="vi">{vietnamese}</strong></span>{copied === vietnamese ? <Check size={19} /> : <Copy size={17} />}</button>)}</div><p className="detail-note" role="status">{copied ? copied.startsWith("Could not") ? copied : "Copied — ready to share." : "Tap a phrase to copy it."}</p></div>}
      {modal === "contact" && <div className="dialog-content contact-content"><span className="contact-flower">✳</span><span className="eyebrow">A FRIENDLY FACE, CLOSE BY</span><h2 id="dialog-title">Ask your host.</h2><p className="detail-description">A place to eat, a ride, or a little help finding your way? Get in touch with Mai Vàng.</p><a className="primary-button" href={homestay.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} />Message on WhatsApp<ArrowUpRight size={17} /></a><a className="secondary-button" href={homestay.zalo} target="_blank" rel="noreferrer">Open Zalo<ArrowUpRight size={17} /></a><a className="phone-link" href={`tel:${homestay.phone}`}>Or call +84 372 237 279</a></div>}
      </div>
    </dialog>
  </>;
}
