"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ArrowUpRight, LocateFixed, MapPin, Navigation, RotateCcw, X } from "lucide-react";
import { categorySymbols, directionsUrl, distanceKm, formatDistance, homestay, type Coordinates, type Place } from "@/lib/config";
import PlaceArt from "./place-art";
import LogoMark from "./logo-mark";
import { useLocale } from "@/lib/i18n";

type Props = {
  places: Place[];
  selected: string | null;
  hovered?: string | null;
  /** Called when a marker is tapped. */
  onSelect: (id: string) => void;
  /** Called when the floating preview card is tapped. Defaults to onSelect. */
  onOpen?: (id: string) => void;
  onClearSelection?: () => void;
  position: Coordinates | null;
  origin?: Coordinates;
  fromMe?: boolean;
  /** Height (px) of UI covering the bottom of the map, e.g. the mobile bottom sheet. */
  bottomInset?: number;
  /** Require two fingers / ctrl+scroll to move the map (useful when the map sits inside a scrolling page). */
  cooperative?: boolean;
  token: string;
  styleUrl: string;
};

export default function LocalMap({
  places,
  selected,
  hovered = null,
  onSelect,
  onOpen,
  onClearSelection,
  position,
  origin = homestay,
  fromMe = false,
  bottomInset = 0,
  cooperative = true,
  token,
  styleUrl,
}: Props) {
  const { locale, t } = useLocale();
  const categoryLabel = (item: Place["category"]) => t(({ Food: "food", Sightseeing: "sightseeing", Cafe: "cafe", Tour: "tour", Essentials: "essentials" } as const)[item]);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const selectRef = useRef(onSelect);
  const insetRef = useRef(bottomInset);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<"" | "mapDetailError" | "mapError">("");
  selectRef.current = onSelect;
  insetRef.current = bottomInset;

  const activePlace = places.find((p) => p.id === selected) || null;

  /** Camera padding that keeps targets visible above the bottom sheet / preview card. */
  function cameraPadding(extra = 0) {
    const height = container.current?.clientHeight || 600;
    const bottom = Math.min(insetRef.current + extra + 30, Math.max(30, height - 180));
    return { top: 70, bottom, left: 30, right: 60 };
  }

  useEffect(() => {
    if (!container.current || !token) return;
    let instance: mapboxgl.Map;
    try {
      instance = new mapboxgl.Map({
        container: container.current,
        accessToken: token,
        style: styleUrl,
        center: [homestay.lng, homestay.lat],
        zoom: 13.3,
        minZoom: 3,
        maxZoom: 19,
        attributionControl: false,
        cooperativeGestures: true,
      });
      map.current = instance;
      instance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
      instance.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
      instance.on("load", () => {
        // Keep street/place names and provider attribution; hide default POI symbols.
        for (const layer of instance.getStyle().layers || []) {
          if (layer.type === "symbol" && /poi|transit.*label/i.test(layer.id)) {
            instance.setLayoutProperty(layer.id, "visibility", "none");
          }
        }
        if (instance.getStyle().imports?.some((i) => i.id === "basemap")) {
          instance.setConfigProperty("basemap", "showPointOfInterestLabels", false);
          instance.setConfigProperty("basemap", "showTransitLabels", false);
        }
        setReady(true);
        setError("");
      });
      instance.on("error", () => {
        setError("mapDetailError");
      });
    } catch {
      setError("mapError");
      return;
    }
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
      setReady(false);
    };
  }, [token, styleUrl]);

  useEffect(() => {
    if (ready && map.current) map.current.setCooperativeGestures(cooperative);
  }, [ready, cooperative]);

  useEffect(() => {
    if (!ready || !map.current) return;
    const instance = map.current;
    const home = document.createElement("button");
    home.className = "home-marker";
    const homeLogo = document.createElement("span");
    homeLogo.className = "logo-mark";
    homeLogo.style.setProperty("--logo-size", "26px");
    homeLogo.setAttribute("aria-hidden", "true");
    const homeImage = document.createElement("img");
    homeImage.className = "logo-mark-image";
    homeImage.src = "/mai-vang-logo.png";
    homeImage.alt = "";
    homeLogo.append(homeImage);
    const homeName = document.createElement("span");
    homeName.textContent = "Mai Vàng";
    home.append(homeLogo, homeName);
    home.type = "button";
    home.setAttribute("aria-label", `${homestay.name}, ${t("homeBase")}`);
    const popup = new mapboxgl.Popup({ offset: 25 }).setText(`${homestay.name} · ${t("homeBase")}`);
    const homeMarker = new mapboxgl.Marker({ element: home })
      .setLngLat([homestay.lng, homestay.lat])
      .setPopup(popup)
      .addTo(instance);

    const markers = places.map((place) => {
      const button = document.createElement("button");
      button.type = "button";
      const isSelected = place.id === selected;
      const isHovered = place.id === hovered;
      button.className = `place-marker marker-${place.category.toLowerCase()} ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""}`.trim();
      button.textContent = categorySymbols[place.category];
      button.title = place.name;
      button.setAttribute("data-name", place.name);
      button.setAttribute("aria-label", `${t("openPlace")} ${place.name}`);
      button.addEventListener("click", () => selectRef.current(place.id));
      return new mapboxgl.Marker({ element: button }).setLngLat([place.lng, place.lat]).addTo(instance);
    });
    return () => {
      homeMarker.remove();
      markers.forEach((m) => m.remove());
    };
  }, [places, selected, hovered, ready, locale]);

  useEffect(() => {
    if (!ready || !map.current || !position) return;
    const element = document.createElement("div");
    element.className = "you-marker";
    element.setAttribute("aria-label", t("myLocation"));
    const marker = new mapboxgl.Marker({ element }).setLngLat([position.lng, position.lat]).addTo(map.current);
    return () => {
      marker.remove();
    };
  }, [position, ready, locale]);

  useEffect(() => {
    const place = places.find((p) => p.id === selected);
    if (ready && place) {
      // Leave room for the floating preview card when the map is partly covered (mobile sheet).
      const extra = insetRef.current > 0 ? 96 : 0;
      map.current?.flyTo({ center: [place.lng, place.lat], zoom: 14.2, essential: false, padding: cameraPadding(extra) });
    }
  }, [selected, places, ready]);

  function fitPlaces() {
    const bounds = new mapboxgl.LngLatBounds([homestay.lng, homestay.lat], [homestay.lng, homestay.lat]);
    places.forEach((p) => bounds.extend([p.lng, p.lat]));
    map.current?.fitBounds(bounds, { padding: cameraPadding(10), maxZoom: 14, duration: 900 });
  }

  function flyHome(target: Coordinates) {
    map.current?.flyTo({ center: [target.lng, target.lat], zoom: 14, padding: cameraPadding() });
  }

  return (
    <section className="map-panel" aria-label={t("mapPlaces")}>
      <div ref={container} className="map-canvas" />
      <div className="map-actions">
        <button title={t("backHome")} aria-label={t("centerHome")} disabled={!ready} onClick={() => flyHome(homestay)}>
          <LogoMark size={19} />
        </button>
        <button title={t("showAll")} aria-label={t("fitPlaces")} disabled={!ready} onClick={fitPlaces}>
          <RotateCcw size={18} />
        </button>
        {position && (
          <button title={t("myLocation")} aria-label={t("centerMe")} disabled={!ready} onClick={() => flyHome(position)}>
            <LocateFixed size={18} />
          </button>
        )}
      </div>
      {!token ? (
        <div className="map-notice">
          <span className="notice-icon" aria-hidden="true">🗺️</span>
          <strong>{t("mapAlmost")}</strong>
          <p>{t("mapConfig")}</p>
        </div>
      ) : error ? (
        <div className="map-warning" role="status">
          {t(error)}
        </div>
      ) : !ready ? (
        <div className="map-notice">
          <span className="map-spinner" />
          <p>{t("mapFinding")}</p>
        </div>
      ) : null}

      {activePlace && (
        <div className="map-preview-card" role="region" aria-label={`${t("selectedPlace")}: ${activePlace.name}`}>
          <button type="button" className="map-preview-main" onClick={() => (onOpen ?? onSelect)(activePlace.id)}>
            <div className="map-preview-thumb">
              <PlaceArt place={activePlace} />
            </div>
            <div className="map-preview-body">
              <span className={`category-label label-${activePlace.category.toLowerCase()}`}>
                {categorySymbols[activePlace.category]} {categoryLabel(activePlace.category)}
              </span>
              <strong>{activePlace.name}</strong>
              <span className="map-preview-meta">
                <MapPin size={12} />
                {formatDistance(distanceKm(origin, activePlace))} {fromMe ? t("fromYou") : t("fromHome")}
              </span>
            </div>
          </button>
          <div className="map-preview-actions">
            <a
              className="map-preview-dir"
              href={directionsUrl(activePlace)}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t("directionsTo")} ${activePlace.name}`}
              title={t("openGoogle")}
            >
              <Navigation size={15} />
              <span>{t("mapGo")}</span>
              <ArrowUpRight size={13} />
            </a>
            {onClearSelection && (
              <button type="button" className="map-preview-close" aria-label={t("closePreview")} onClick={onClearSelection}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="map-legend">
        <LogoMark size={17} /> {t("homeBase")} <span className="legend-line" /> <span>🌿</span> {t("discoveries")}
      </div>
    </section>
  );
}
