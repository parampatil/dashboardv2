"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Geocoding cache
const geocodeCache: Record<string, string> = {};

function formatLocation(placeName: string): string {
  if (!placeName) return "Unknown location";
  const parts = placeName.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return parts.slice(-2).join(", ");
  }
  return placeName;
}

interface Provider {
  id?: string;
  name?: string;
  // Add other provider properties as needed
}

interface Location {
  key: string;
  latitude: number;
  longitude: number;
  providers: Provider[];
}

interface LocationMapProps {
  locations: Location[];
  currentPrecision: number;
  onZoomChange: (precision: string) => void;
  isFullScreen: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({ locations, onZoomChange, isFullScreen }) => {
  const [viewState, setViewState] = useState({
    longitude: -95,
    latitude: 40,
    zoom: 2.0,
    pitch: 0,
    bearing: 0,
  });
  const [locationPlaces, setLocationPlaces] = useState<Record<string, string>>({});
  const [loadingPlaces, setLoadingPlaces] = useState<Record<string, boolean>>({});
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Geohash precision logic (unchanged)
  const getGeohashPrecision = useCallback((zoomLevel: number) => {
    if (zoomLevel < 3) return 1;
    if (zoomLevel < 6) return 2;
    if (zoomLevel < 8) return 3;
    if (zoomLevel < 10) return 4;
    if (zoomLevel < 12) return 5;
    if (zoomLevel < 14) return 6;
    if (zoomLevel < 16) return 7;
    return 8;
  }, []);

  // Update precision on zoom
  useEffect(() => {
    const newPrecision = getGeohashPrecision(viewState.zoom);
    onZoomChange(newPrecision.toString());
  }, [viewState.zoom, getGeohashPrecision, onZoomChange]);

  // Globe rotation along equator (longitude only)
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const rotationSpeed = 1; // degrees per second

    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      if (viewState.zoom < 3) {
        setViewState((prev) => ({
          ...prev,
          longitude: (prev.longitude + rotationSpeed * deltaTime / 1000) % 360,
        }));
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [viewState.zoom]);

  // Fetch geocoding for all locations
  useEffect(() => {
    locations.forEach((location) => {
      fetchPlaceInfo(location.latitude, location.longitude, location.key);
    });
    // eslint-disable-next-line
  }, [locations]);

  // Fetch place info with Mapbox Geocoding
  const fetchPlaceInfo = async (latitude: number, longitude: number, locationKey: string) => {
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    setLoadingPlaces((prev) => ({ ...prev, [locationKey]: true }));
    if (geocodeCache[cacheKey]) {
      setLocationPlaces((prev) => ({
        ...prev,
        [locationKey]: geocodeCache[cacheKey],
      }));
      setLoadingPlaces((prev) => ({ ...prev, [locationKey]: false }));
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place,region,country`
      );
      if (!response.ok) throw new Error("Geocoding failed");
      const data = await response.json();
      let placeName = "Unknown location";
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        placeName = feature.place_name || feature.text || "Unknown location";
      }
      geocodeCache[cacheKey] = placeName;
      setLocationPlaces((prev) => ({ ...prev, [locationKey]: placeName }));
    } catch {
      setLocationPlaces((prev) => ({
        ...prev,
        [locationKey]: "Location lookup failed",
      }));
    } finally {
      setLoadingPlaces((prev) => ({ ...prev, [locationKey]: false }));
    }
  };

  // Marker color by user count
  const getMarkerColor = (count: number) => {
    const startColor = [30, 144, 255]; // Dodger Blue
    const endColor = [255, 0, 0]; // Red
    const interpolate = (start: number, end: number, factor: number) =>
      Math.round(start + (end - start) * factor);
    const factor = Math.min(Math.max((count - 1) / 9, 0), 1);
    const r = interpolate(startColor[0], endColor[0], factor);
    const g = interpolate(startColor[1], endColor[1], factor);
    const b = interpolate(startColor[2], endColor[2], factor);
    return `rgba(${r}, ${g}, ${b}, 0.9)`;
  };

  useEffect(() => {
    if (mapRef.current) {
      // Short timeout to ensure DOM has updated
      setTimeout(() => {
        mapRef.current?.resize();
      }, 100);
    }
  }, [isFullScreen]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-6 h-screen">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
        projection={"globe"}
        ref={(ref) => {
          mapRef.current = ref?.getMap() || null;
        }}
      >
        {/* <NavigationControl position="top-right" /> */}
        {locations.map((location) => (
          <Marker
            key={`${location.key}-${location.latitude}-${location.longitude}`}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center group">
              {/* Lucide MapPinned as marker */}
              <MapPin
                className="w-8 h-8 drop-shadow-lg"
                color={getMarkerColor(location.providers.length)}
                strokeWidth={2.5}
                absoluteStrokeWidth
              />
              {/* User count bubble */}
              {/* <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200 shadow group-hover:scale-105 transition-transform">
                {location.providers.length}
              </div> */}
              {/* Popup */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-2 rounded text-white text-sm min-w-[180px] text-center pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 opacity-0 transition-opacity z-10"
              >
                {location.providers.length} User
                {location.providers.length !== 1 && "s"} in{" "}
                {loadingPlaces[location.key] ? (
                  <span className="italic opacity-80">loading...</span>
                ) : (
                  formatLocation(locationPlaces[location.key])
                )}
              </motion.div>
            </div>
          </Marker>
        ))}
      </Map>
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
        {/* <span>Precision: {currentPrecision}</span>
        <span>|</span>
        <span>Zoom: {viewState.zoom.toFixed(1)}</span> */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Total Users:</span> 
            <span className="text-blue-300 font-bold text-base">
              {locations.reduce((total, location) => total + location.providers.length, 0).toLocaleString()}
            </span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse mx-3"></div>
          <span className="text-sm text-blue-200">Active Globally</span>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
