"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocationData } from "@/types/location";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type LayoutMode } from "@/app/dashboard/location/active-user-ids/page";
import CopyTooltip from "../ui/CopyToolTip";

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Cache for geocoding results to avoid redundant API calls
const geocodeCache: Record<string, string> = {};

interface LocationMapProps {
  locations: LocationData[];
  currentPrecision: number;
  onZoomChange: (precision: string) => void;
  layoutMode: LayoutMode;
}

const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  currentPrecision,
  onZoomChange,
  layoutMode,
}) => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [locationPlace, setLocationPlace] = useState<string>("");
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);

  // Add a mapContainer ref to track the map element
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Force rerender when layout changes
  const [mapKey, setMapKey] = useState(Date.now());

  useEffect(() => {
    // Force map to rerender when layout changes by updating the key
    setMapKey(Date.now());
  }, [layoutMode]);

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
    const newPrecision = getGeohashPrecision(viewState.zoom);
    onZoomChange(newPrecision.toString());
  }, [viewState.zoom, getGeohashPrecision, onZoomChange]);

  // Center map on the first available location in the data when first loaded or when locations change
  useEffect(() => {
    const availableLocation = locations.find(
      (location) => location.latitude && location.longitude
    );

    if (
      availableLocation &&
      viewState.latitude === 20 &&
      viewState.longitude === 0
    ) {
      setViewState((prev) => ({
        ...prev,
        latitude: availableLocation.latitude,
        longitude: availableLocation.longitude,
        zoom: 4, // Default zoom level
      }));
    }
  }, [locations]);

  // Fetch place information when a location is selected
  useEffect(() => {
    if (selectedLocation) {
      fetchPlaceInfo(selectedLocation.latitude, selectedLocation.longitude);
    } else {
      setLocationPlace("");
    }
  }, [selectedLocation]);

  // Function to fetch place information using Mapbox geocoding
  const fetchPlaceInfo = async (latitude: number, longitude: number) => {
    setIsLoadingPlace(true);
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

    // Return cached result if available
    if (geocodeCache[cacheKey]) {
      setLocationPlace(geocodeCache[cacheKey]);
      setIsLoadingPlace(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place,region,country`
      );

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();

      // Extract relevant place information
      let placeName = "Unknown location";
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        placeName = feature.place_name || feature.text || "Unknown location";
      }

      // Cache the result
      geocodeCache[cacheKey] = placeName;

      // Update state
      setLocationPlace(placeName);
    } catch (error) {
      console.error("Error fetching place info:", error);
      setLocationPlace("Location lookup failed");
    } finally {
      setIsLoadingPlace(false);
    }
  };

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
    <div
      ref={mapContainerRef}
      className={`relative rounded-lg overflow-hidden border border-gray-200 mb-6 ${
        layoutMode === "stacked" ? "h-[500px]" : "h-[800px]"
      }`}
    >
      <Map
        key={mapKey}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
        projection={"globe"}
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
            anchor="bottom"
            maxWidth="300px"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-4 w-full max-w-[300px]"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-base text-gray-900">
                  Users at this location
                </h3>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Place name */}
              <div className="mb-3">
                {isLoadingPlace ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm text-gray-500 italic"
                  >
                    Loading location info...
                  </motion.div>
                ) : (
                  <div className="text-sm bg-blue-500 py-1.5 px-2 rounded-md text-white">
                    {locationPlace}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500">
                  Lat: {selectedLocation.latitude.toFixed(6)}
                </div>
                <div className="text-sm text-gray-500">
                  Long: {selectedLocation.longitude.toFixed(6)}
                </div>
              </div>

              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 me-2">
                  {selectedLocation.providers.length} User
                  {selectedLocation.providers.length !== 1 && "s"}
                </Badge>
                <div className="text-xs text-gray-500">
                  Key: {selectedLocation.key}
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto mt-2">
                <ul className="space-y-1.5">
                  {selectedLocation.providers.map((provider) => (
                    <li
                      key={provider.id}
                      className="text-sm py-1.5 px-2.5 bg-gray-50 border border-gray-100 rounded flex items-center justify-between"
                    >
                      <CopyTooltip triggerContent={provider.name} content={provider.id} prefix="ID:" />
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </Popup>
        )}
      </Map>

      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
        <span>Precision: {currentPrecision}</span>
        <span>|</span>
        <span>Zoom: {viewState.zoom.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default LocationMap;
