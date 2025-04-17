// components/LocationMap.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { LocationData, GetAllActiveUserIdsResponse } from "@/types/location";
import { motion } from "framer-motion";
import { X } from "lucide-react";

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface LocationMapProps {
  caches: GetAllActiveUserIdsResponse["caches"];
}

const LocationMap: React.FC<LocationMapProps> = ({ caches }) => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
  });

  const [currentPrecision, setCurrentPrecision] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );

  // Calculate geohash precision based on zoom level
  const getGeohashPrecision = useCallback((zoomLevel: number): number => {
    if (zoomLevel < 3) {
      return 1; // Very coarse
    } else if (zoomLevel < 6) {
      return 2;
    } else if (zoomLevel < 8) {
      return 3;
    } else if (zoomLevel < 10) {
      return 4;
    } else if (zoomLevel < 12) {
      return 5;
    } else if (zoomLevel < 14) {
      return 6;
    } else if (zoomLevel < 16) {
      return 7;
    } else {
      return 8; // Finest precision for zoom 16+
    }
  }, []);

  // Update precision when zoom changes
  useEffect(() => {
    setCurrentPrecision(getGeohashPrecision(viewState.zoom));
  }, [viewState.zoom, getGeohashPrecision]);

  // Get locations for current precision
  const getLocationsForCurrentPrecision = () => {
    const cache = caches[currentPrecision.toString()];
    if (!cache || !cache.locations) {
      return [];
    }

    return Object.entries(cache.locations).map(([key, location]) => ({
      key,
      ...location,
    }));
  };

  const locations = getLocationsForCurrentPrecision();

  // Center map on locations when first loaded
  useEffect(() => {
    if (locations.length > 0) {
      // Find average of all location coordinates to center the map
      const total = locations.reduce(
        (acc, loc) => {
          return {
            lat: acc.lat + loc.latitude,
            lng: acc.lng + loc.longitude,
          };
        },
        { lat: 0, lng: 0 }
      );

      const center = {
        latitude: total.lat / locations.length,
        longitude: total.lng / locations.length,
      };

      setViewState((prev) => ({
        ...prev,
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: 4,
      }));
    }
  }, []);

  // Determine marker color based on number of users
  const getMarkerColor = (count: number) => {
    const startColor = [30, 144, 255]; // Dodger Blue (Low density)
    const endColor = [255, 0, 0]; // Red (High density)

    const interpolate = (start: number, end: number, factor: number) =>
      Math.round(start + (end - start) * factor);

    const factor = Math.min(Math.max((count - 1) / 9, 0), 1); // Normalize count to range [0, 1]

    const r = interpolate(startColor[0], endColor[0], factor);
    const g = interpolate(startColor[1], endColor[1], factor);
    const b = interpolate(startColor[2], endColor[2], factor);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="relative h-[800px] w-full rounded-lg overflow-hidden border border-gray-200">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {locations.map((location) => (
          <Marker
            key={`${location.key}-${location.latitude}-${location.longitude}`}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <div className="relative cursor-pointer">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{
                  backgroundColor: getMarkerColor(location.providers.length),
                }}
              >
                {location.providers.length}
              </div>
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent"
                style={{
                  borderTopColor: getMarkerColor(location.providers.length),
                }}
              ></div>
            </div>
          </Marker>
        ))}

        {selectedLocation && (
            <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            onClose={() => setSelectedLocation(null)}
            closeButton={false}
            closeOnClick={true}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-4 w-64"
            >
              <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-base text-gray-900">
            Users at this location ({selectedLocation.providers.length})
            </h3>
            <button
            onClick={() => setSelectedLocation(null)}
            className="text-gray-400 hover:text-gray-600 transition"
            >
            <X className="h-5 w-5" />
            </button>
              </div>
              <div className="max-h-40 overflow-y-auto">
            <ul className="space-y-2">
            {selectedLocation.providers.map((provider) => (
              <li
              key={provider.id}
              className="text-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm flex items-center"
              >
              <span className="font-medium text-gray-800">
            {provider.name}
              </span>
              </li>
            ))}
            </ul>
              </div>
            </motion.div>
            </Popup>
        )}
      </Map>

      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        Precision: {currentPrecision} | Zoom: {viewState.zoom.toFixed(1)}
      </div>
    </div>
  );
};

export default LocationMap;
