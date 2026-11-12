"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ArrowUpRight, Home, LocateFixed, MapPin, Navigation, RotateCcw, X } from "lucide-react";
import { categorySymbols, directionsUrl, distanceKm, formatDistance, homestay, type Coordinates, type Place } from "@/lib/config";
import PlaceArt from "./place-art";

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
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const selectRef = useRef(onSelect);
  const insetRef = useRef(bottomInset);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
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
        setError("Some map details could not load. Your list and directions still work.");
      });
    } catch {
      setError("The map could not start on this browser. Explore the places in the list instead.");
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
    home.innerHTML = '<span aria-hidden="true">✳</span><span>Mai Vàng</span>';
    home.type = "button";
    home.setAttribute("aria-label", "Mai Vàng Homestay, your home base");
    const popup = new mapboxgl.Popup({ offset: 25 }).setText("Mai Vàng Homestay · Your home base");
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
      button.setAttribute("aria-label", `Open ${place.name}`);
      button.addEventListener("click", () => selectRef.current(place.id));
      return new mapboxgl.Marker({ element: button }).setLngLat([place.lng, place.lat]).addTo(instance);
    });
    return () => {
      homeMarker.remove();
      markers.forEach((m) => m.remove());
    };
  }, [places, selected, hovered, ready]);

  useEffect(() => {
    if (!ready || !map.current || !position) return;
    const element = document.createElement("div");
    element.className = "you-marker";
    element.setAttribute("aria-label", "Your approximate location");
    const marker = new mapboxgl.Marker({ element }).setLngLat([position.lng, position.lat]).addTo(map.current);
    return () => {
      marker.remove();
    };
  }, [position, ready]);

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
    <section className="map-panel" aria-label="Map of recommended places">
      <div ref={container} className="map-canvas" />
      <div className="map-actions">
        <button title="Back to homestay" aria-label="Center map on homestay" disabled={!ready} onClick={() => flyHome(homestay)}>
          <Home size={18} />
        </button>
        <button title="Show all places" aria-label="Fit all places on map" disabled={!ready} onClick={fitPlaces}>
          <RotateCcw size={18} />
        </button>
        {position && (
          <button title="Show my location" aria-label="Center map on my location" disabled={!ready} onClick={() => flyHome(position)}>
            <LocateFixed size={18} />
          </button>
        )}
      </div>
      {!token ? (
        <div className="map-notice">
          <span className="notice-icon" aria-hidden="true">🗺️</span>
          <strong>Your map is almost ready</strong>
          <p>Add your Mapbox public token to the local configuration. The curated guide is ready to explore.</p>
        </div>
      ) : error ? (
        <div className="map-warning" role="status">
          {error}
        </div>
      ) : !ready ? (
        <div className="map-notice">
          <span className="map-spinner" />
          <p>Finding our little corner of Bến Tre…</p>
        </div>
      ) : null}

      {activePlace && (
        <div className="map-preview-card" role="region" aria-label={`Selected place: ${activePlace.name}`}>
          <button type="button" className="map-preview-main" onClick={() => (onOpen ?? onSelect)(activePlace.id)}>
            <div className="map-preview-thumb">
              <PlaceArt place={activePlace} />
            </div>
            <div className="map-preview-body">
              <span className={`category-label label-${activePlace.category.toLowerCase()}`}>
                {categorySymbols[activePlace.category]} {activePlace.category}
              </span>
              <strong>{activePlace.name}</strong>
              <span className="map-preview-meta">
                <MapPin size={12} />
                {formatDistance(distanceKm(origin, activePlace))} {fromMe ? "from you" : "from home"}
              </span>
            </div>
          </button>
          <div className="map-preview-actions">
            <a
              className="map-preview-dir"
              href={directionsUrl(activePlace)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Directions to ${activePlace.name}`}
              title="Open in Google Maps"
            >
              <Navigation size={15} />
              <span>Go</span>
              <ArrowUpRight size={13} />
            </a>
            {onClearSelection && (
              <button type="button" className="map-preview-close" aria-label="Close place preview" onClick={onClearSelection}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="map-legend">
        <span className="legend-home">✳</span> Your home base <span className="legend-line" /> <span>🌿</span> Local discoveries
      </div>
    </section>
  );
}
