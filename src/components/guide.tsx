"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Compass,
  Copy,
  Languages,
  LocateFixed,
  Map,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Sparkles,
  Utensils,
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
import PlaceArt from "./place-art";
import LogoMark from "./logo-mark";
import SiteHeader from "./site-header";
import PhraseList from "./phrase-list";
import { useLocale } from "@/lib/i18n";

const LocalMap = dynamic(() => import("./local-map"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const { t } = useLocale();
  return <div className="map-panel map-loading"><span className="map-spinner" /><span>{t("mapUnfolding")}</span></div>;
}

type FilterCategory = Category | "All" | "Out & About";
const filterCategories: FilterCategory[] = ["All", "Food", "Sightseeing", "Cafe", "Out & About"];
type SheetSnap = "peek" | "half" | "full";
const sheetOrder: SheetSnap[] = ["peek", "half", "full"];
const MOBILE_QUERY = "(max-width: 760px)";

export default function Guide({
  data,
  token,
  styleUrl,
}: {
  data: PlacesResult;
  token: string;
  styleUrl: string;
}) {
  const { t } = useLocale();
  const categoryLabel = (item: FilterCategory) => t(({ All: "all", Food: "food", Sightseeing: "sightseeing", Cafe: "cafe", Tour: "tour", Essentials: "essentials", "Out & About": "outAbout" } as const)[item]);
  const [category, setCategory] = useState<FilterCategory>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [modal, setModal] = useState<"place" | "phrases" | "contact" | null>(null);
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<"" | "noGeolocation" | "locationSuccess" | "locationDenied" | "locationError">("");
  const [sort, setSort] = useState<"home" | "me">("home");
  const [copied, setCopied] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const locationRequest = useRef(0);

  // Mobile bottom sheet: the map fills the stage and the list slides over it.
  const [isMobile, setIsMobile] = useState(false);
  const [sheet, setSheet] = useState<SheetSnap>("half");
  const [stageHeight, setStageHeight] = useState(0);
  const [peekHeight, setPeekHeight] = useState(136);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetHeaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startH: number; lastY: number; lastT: number; velocity: number; moved: boolean } | null>(null);

  const fromMe = sort === "me" && Boolean(position);
  const origin = fromMe && position ? position : homestay;

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: data.places.length };
    for (const c of categories) map[c] = 0;
    for (const p of data.places) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    map["Out & About"] = map.Tour + map.Essentials;
    return map;
  }, [data.places]);

  const filtered = useMemo(
    () =>
      data.places
        .filter(
          (p) =>
            (category === "All" || p.category === category || (category === "Out & About" && (p.category === "Tour" || p.category === "Essentials"))) &&
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

  function scrollStageIntoView() {
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showOnMap(id: string) {
    setSelected(id);
    setModal(null);
    if (isMobile) {
      setSheet("peek");
      requestAnimationFrame(scrollStageIntoView);
    }
  }

  /** Marker tap: on mobile, preview it above the sheet instead of covering the map with a dialog. */
  function selectFromMap(id: string) {
    if (!isMobile) {
      openPlace(id);
      return;
    }
    setSelected(id);
    setSheet("peek");
    const card = document.getElementById(`place-${id}`);
    if (card && listRef.current) listRef.current.scrollTo({ top: card.offsetTop - 8, behavior: "smooth" });
  }

  const snapHeights: Record<SheetSnap, number> = {
    peek: peekHeight,
    half: Math.round(stageHeight * 0.52),
    full: Math.max(peekHeight, stageHeight - 66),
  };
  const restHeight = isMobile && stageHeight > 0 ? snapHeights[sheet] : 0;

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const header = sheetHeaderRef.current;
    if (!stage || !header) return;
    const observer = new ResizeObserver(() => {
      setStageHeight(stage.clientHeight);
      setPeekHeight(header.offsetHeight);
    });
    observer.observe(stage);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // The sheet height lives in a CSS variable so dragging never re-renders React.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || drag.current) return;
    if (restHeight) stage.style.setProperty("--sheet-h", `${restHeight}px`);
    else stage.style.removeProperty("--sheet-h");
  }, [restHeight]);

  function snapTo(target: SheetSnap) {
    stageRef.current?.style.setProperty("--sheet-h", `${snapHeights[target]}px`);
    setSheet(target);
  }

  function cycleSheet() {
    snapTo(sheet === "peek" ? "half" : sheet === "half" ? "full" : "half");
  }

  function onSheetPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isMobile || !stageHeight) return;
    if ((event.target as HTMLElement).closest("input, select, .search-box button, .category-tabs, .sort-control")) return;
    drag.current = {
      startY: event.clientY,
      startH: snapHeights[sheet],
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    stageRef.current?.classList.add("is-dragging");
  }

  function onSheetPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    const delta = state.startY - event.clientY;
    if (Math.abs(delta) > 5) state.moved = true;
    const height = Math.min(snapHeights.full + 12, Math.max(snapHeights.peek - 24, state.startH + delta));
    stageRef.current?.style.setProperty("--sheet-h", `${height}px`);
    const dt = Math.max(1, event.timeStamp - state.lastT);
    state.velocity = (state.lastY - event.clientY) / dt;
    state.lastY = event.clientY;
    state.lastT = event.timeStamp;
  }

  function onSheetPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    stageRef.current?.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!state.moved) {
      cycleSheet();
      return;
    }
    const height = state.startH + (state.startY - state.lastY);
    let target: SheetSnap;
    if (Math.abs(state.velocity) > 0.45) {
      const ordered = sheetOrder.filter((snap) => (state.velocity > 0 ? snapHeights[snap] > height : snapHeights[snap] < height));
      target = state.velocity > 0 ? ordered[0] ?? "full" : ordered[ordered.length - 1] ?? "peek";
    } else {
      target = sheetOrder.reduce((best, snap) =>
        Math.abs(snapHeights[snap] - height) < Math.abs(snapHeights[best] - height) ? snap : best
      );
    }
    snapTo(target);
  }

  function onGrabberKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = sheetOrder.indexOf(sheet);
    if (event.key === "ArrowUp" && index < 2) {
      event.preventDefault();
      snapTo(sheetOrder[index + 1]);
    } else if (event.key === "ArrowDown" && index > 0) {
      event.preventDefault();
      snapTo(sheetOrder[index - 1]);
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setLocationMessage("noGeolocation");
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
        setLocationMessage("locationSuccess");
      },
      (error) => {
        if (requestId !== locationRequest.current) return;
        setLocating(false);
        setLocationMessage(
          error.code === 1
            ? "locationDenied"
            : "locationError"
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
      setCopied("__copy_failed__");
    }
  }

  return (
    <>
      <a className="skip-link" href="#places">
        {t("skipPlaces")}
      </a>

      <SiteHeader onPhrases={() => setModal("phrases")} onContact={() => setModal("contact")} />

      <main>
        {/* Compact introduction */}
        <section className="intro-compact" id="explore">
          <div className="intro-compact-text">
            <p className="eyebrow">
              <span className="eyebrow-dot" /> {t("handpicked")}
            </p>
            <h1>
              {t("intro")}{" "}
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
              {t("introCopy")}
            </p>
          </div>

        </section>

        {/* Main Explorer Section */}
        <section className="explorer" id="explorer-section" aria-label={t("localGuide")}>
          <div ref={stageRef} className={`explorer-stage sheet-${sheet}`}>
            <div className="explorer-toolbar">
              <button
                type="button"
                className={`location-button ${position ? "is-active" : ""}`}
                onClick={locate}
                disabled={locating}
              >
                <LocateFixed size={15} />
                <span className="location-button-text">
                  {locating ? t("locating") : position ? t("updateLocation") : t("nearMe")}
                </span>
              </button>
            </div>

            {locationMessage && (
              <div className="location-status" role="status">
                <LocateFixed size={15} />
                <span>{t(locationMessage)}</span>
                <button
                  type="button"
                  className="status-dismiss"
                  aria-label={t("dismissLocation")}
                  onClick={() => setLocationMessage("")}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="explorer-body">
              <section className="places-panel" id="places" aria-label={t("recommendedPlaces")}>
                <div
                  ref={sheetHeaderRef}
                  className="places-panel-header"
                  onPointerDown={onSheetPointerDown}
                  onPointerMove={onSheetPointerMove}
                  onPointerUp={onSheetPointerUp}
                  onPointerCancel={onSheetPointerUp}
                >
                  <div className="sheet-grabber-row">
                    <button
                      type="button"
                      className="sheet-grabber"
                      aria-label={`${t("placeSheet")} (${sheet} ${t("view")}). ${t("resizeSheet")}`}
                      onKeyDown={onGrabberKeyDown}
                    >
                      <span className="sheet-grabber-pill" aria-hidden="true" />
                    </button>
                    <div className="sheet-snap-pills" role="group" aria-label={t("sheetHeight")}>
                      <button
                        type="button"
                        className={sheet === "peek" ? "active" : ""}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => snapTo("peek")}
                      >
                        {t("map")}
                      </button>
                      <button
                        type="button"
                        className={sheet === "half" ? "active" : ""}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => snapTo("half")}
                      >
                        {t("split")}
                      </button>
                      <button
                        type="button"
                        className={sheet === "full" ? "active" : ""}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => snapTo("full")}
                      >
                        {t("list")} ({filtered.length})
                      </button>
                    </div>
                  </div>

                  <label className="search-box">
                    <Search size={16} />
                    <input
                      aria-label={t("searchLabel")}
                      placeholder={t("search")}
                      value={query}
                      onFocus={() => {
                        if (isMobile && sheet === "peek") snapTo("half");
                      }}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button type="button" aria-label={t("clearSearch")} onClick={() => setQuery("")}>
                        <X size={15} />
                      </button>
                    )}
                  </label>

                  <div className="category-filter-row">
                    <div className="category-tabs" role="group" aria-label={t("filterLabel")}>
                      {filterCategories.map((item) => (
                        <button type="button" key={item} className={category === item ? "active" : ""}
                          aria-pressed={category === item} onClick={() => setCategory(item)} title={categoryLabel(item)}>
                          {item === "All" ? <Compass size={15} /> : <span className="tab-emoji" aria-hidden="true">{item === "Out & About" ? "✦" : categorySymbols[item]}</span>}
                          <span>{categoryLabel(item)}</span>
                          {data.places.length > 0 && <em className="tab-count">{counts[item]}</em>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div ref={listRef} className="place-list">
                  {data.status === "error" || data.status === "unconfigured" ? (
                    <div className="empty-state">
                      <div className="empty-icon-wrap">
                        <MapPin size={26} />
                      </div>
                      <h2>{t("guidePause")}</h2>
                      <p>
                        {data.status === "unconfigured"
                          ? t("configureSheet")
                          : t("loadError")}
                      </p>
                      <button type="button" className="primary-button" onClick={() => window.location.reload()}>
                        {t("tryAgain")}
                      </button>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon-wrap">
                        <Compass size={26} />
                      </div>
                      <h2>{data.places.length ? t("noMatches") : t("placesComing")}</h2>
                      <p>
                        {data.places.length
                          ? t("tryAnother")
                          : t("preparing")}
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
                          {t("showAll")} <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  ) : (
                    filtered.map((p, index) => (
                      <article
                        key={p.id}
                        id={`place-${p.id}`}
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
                            <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                          </div>
                          <div className="card-content">
                            <div className="card-top-row">
                              <span className={`category-label label-${p.category.toLowerCase()}`}>
                                {categorySymbols[p.category]} {categoryLabel(p.category)}
                              </span>
                              <span className="card-distance">
                                <MapPin size={12} />
                                {formatDistance(distanceKm(origin, p))} {fromMe ? t("fromYou") : t("fromHome")}
                              </span>
                            </div>
                            <h2>{p.name}</h2>
                            <p>{p.description || t("selectedByHost")}</p>

                            {p.whatToOrder && (
                              <div className="card-dish-strip">
                                <Utensils size={11} />
                                <span>{p.whatToOrder}</span>
                              </div>
                            )}

                            <div className="card-meta">
                              <div className="card-tags">
                                {p.priceRange && <span className="card-tag">{p.priceRange}</span>}
                                {!p.priceRange && (p.openingHours || p.closingHours) && <span className="card-tag">{[p.openingHours, p.closingHours].filter(Boolean).join(" – ")}</span>}
                                {p.tips && (
                                  <span className="card-tag tag-highlight">
                                    <Sparkles size={11} /> {t("tip")}
                                  </span>
                                )}
                              </div>
                              <span className="card-arrow">
                                <span>{t("details")}</span>
                                <ArrowUpRight size={14} />
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <LocalMap
                places={filtered}
                selected={selected}
                hovered={hovered}
                onSelect={selectFromMap}
                onOpen={openPlace}
                onClearSelection={() => setSelected(null)}
                position={position}
                origin={origin}
                fromMe={fromMe}
                bottomInset={restHeight}
                cooperative={!isMobile}
                token={token}
                styleUrl={styleUrl}
              />
            </div>
          </div>

          <p className="distance-note">
            {t("straightLine")}
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="footer-brand">
            <LogoMark size={20} />
            <span>{t("madeFor")}</span>
          </span>
          <small>{homestay.name} · {t("localGuide")}</small>
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
          <button type="button" className="dialog-close" aria-label={t("closeDialog")} onClick={() => setModal(null)}>
            <X size={20} />
          </button>

          {modal === "place" && place && (
            <>
              <div className="dialog-hero">
                <PlaceArt key={place.id} place={place} large />
                <span className={`dialog-category-badge label-${place.category.toLowerCase()}`}>
                  {categorySymbols[place.category]} {categoryLabel(place.category)}
                </span>
              </div>
              <div className="dialog-content">
                <h2 id="dialog-title">{place.name}</h2>
                <p className="detail-distance">
                  <MapPin size={15} />
                  <span>
                    <strong>{formatDistance(distanceKm(homestay, place))}</strong> {t("fromMaiVang")}
                    {position && (
                      <>
                        {" "}
                        · <strong>{formatDistance(distanceKm(position, place))}</strong> {t("fromYou")}
                      </>
                    )}{" "}
                    <span className="detail-distance-sub">{t("straightLineShort")}</span>
                  </span>
                </p>
                <p className="detail-description">
                  {place.description || t("askHostSpecial")}
                </p>

                <div className="detail-facts">
                  <div className="fact-box">
                    <Wallet size={18} />
                    <div>
                      <span>{t("priceRange")}</span>
                      <strong>{place.priceRange || t("askLocally")}</strong>
                    </div>
                  </div>
                  <div className="fact-box">
                    <Clock3 size={18} />
                    <div>
                      <span>{t("openingHours")}</span>
                      <strong>{[place.openingHours, place.closingHours].filter(Boolean).join(" – ") || t("checkBefore")}</strong>
                    </div>
                  </div>
                </div>

                {place.whatToOrder && (
                  <section className="order-card">
                    <div className="order-card-header">
                      <span className="eyebrow">
                        <Utensils size={12} /> {t("orderTitle")}
                      </span>
                      <button
                        type="button"
                        className="order-copy-btn"
                        onClick={() => copyPhrase(place.whatToOrder, true)}
                      >
                        {copied === place.whatToOrder ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied === place.whatToOrder ? t("copied") : t("copySpeak")}</span>
                      </button>
                    </div>
                    <p lang="vi">{place.whatToOrder}</p>
                    <small>{t("showVendor")}</small>
                  </section>
                )}

                {place.tips && (
                  <section className="tip-card">
                    <span className="tip-badge" aria-hidden="true">
                      <LogoMark size={23} />
                    </span>
                    <div>
                      <strong>{t("hostTip")}</strong>
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
                    <span>{t("letsGo")}</span>
                    <ArrowUpRight size={17} />
                  </a>
                  <button
                    type="button"
                    className="secondary-button map-jump-button"
                    onClick={() => showOnMap(place.id)}
                  >
                    <Map size={17} />
                    <span>{t("locatePin")}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {modal === "phrases" && (
            <div className="dialog-content phrases-content">
              <span className="eyebrow">
                <Languages size={13} /> {t("speakNeighbor")}
              </span>
              <h2 id="dialog-title">{t("littleVietnamese")}</h2>
              <p className="detail-description">
                {t("phraseIntro")}
              </p>
              <PhraseList copied={copied} onChoose={(vietnamese) => copyPhrase(vietnamese, true)} />
              <p className="detail-note" role="status">
                {copied
                  ? copied === "__copy_failed__"
                    ? t("copyFailed")
                    : t("copyReady")
                  : t("phraseHint")}
              </p>
            </div>
          )}

          {modal === "contact" && (
            <div className="dialog-content contact-content">
              <span className="contact-flower" aria-hidden="true">
                <LogoMark size={48} />
              </span>
              <span className="eyebrow">{t("happyHelp")}</span>
              <h2 id="dialog-title">{t("askHostTitle")}</h2>
              <p className="detail-description">
                {t("contactIntro")}
              </p>
              <div className="contact-actions">
                <a className="primary-button" href={homestay.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} />
                  <span>{t("whatsapp")}</span>
                  <ArrowUpRight size={17} />
                </a>
                <a className="secondary-button" href={homestay.instagram} target="_blank" rel="noreferrer">
                  <span>{t("instagram")}</span>
                  <ArrowUpRight size={17} />
                </a>
              </div>
              <a className="phone-link" href={`tel:${homestay.phone}`}>
                {t("call")}: +84 372 237 278
              </a>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
