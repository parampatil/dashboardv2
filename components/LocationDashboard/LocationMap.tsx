// components/LocationMap.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import { LocationData, GetAllActiveUserIdsResponse } from "@/types/location";

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoieWVya2VidWxhbi0zNjB3b3JsZCIsImEiOiJjbTVod3o2ZXMwbTU2MmtzODVvcG1xZXdqIn0.5A2YEttyY3uJlmaZ7OwNig';

interface LocationMapProps {
  caches: GetAllActiveUserIdsResponse["caches"];
}

const LocationMap: React.FC<LocationMapProps> = ({ caches }) => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0
  });
  
  const [currentPrecision, setCurrentPrecision] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
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
      ...location
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
            lng: acc.lng + loc.longitude
          };
        },
        { lat: 0, lng: 0 }
      );
      
      const center = {
        latitude: total.lat / locations.length,
        longitude: total.lng / locations.length
      };
      
      setViewState(prev => ({
        ...prev,
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: 4
      }));
    }
  }, []);
  
  // Determine marker color based on number of users
  const getMarkerColor = (count: number) => {
    if (count >= 10) return '#FF0000'; // Red for 10+
    if (count >= 5) return '#FFA500';  // Orange for 5-9
    if (count >= 3) return '#FFFF00';  // Yellow for 3-4
    return '#0000FF';                  // Blue for 1-2
  };
  
  return (
    <div className="relative h-[800px] w-full rounded-lg overflow-hidden border border-gray-200">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        
        {locations.map((location) => (
          <Marker
            key={`${location.key}-${location.latitude}-${location.longitude}`}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <div className="relative cursor-pointer">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: getMarkerColor(location.providers.length) }}
              >
                {location.providers.length}
              </div>
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent" 
                style={{ borderTopColor: getMarkerColor(location.providers.length) }}
              ></div>
            </div>
          </Marker>
        ))}
        
        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            anchor="bottom"
            onClose={() => setSelectedLocation(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-sm mb-2">
                Users at this location ({selectedLocation.providers.length})
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {selectedLocation.providers.map(provider => (
                    <li key={provider.id} className="text-sm py-1 border-b border-gray-100 last:border-0">
                      {provider.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        Precision: {currentPrecision} | Zoom: {viewState.zoom.toFixed(1)}
      </div>
    </div>
  );
};

export default LocationMap;
