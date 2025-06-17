"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { LocationData, GetAllActiveUserIdsResponse } from "@/types/location";
import LocationMap from "@/components/DemoDashboard/Globe2";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function ActiveUserIds() {
  // Map data state
  const [mapPrecision, setMapPrecision] = useState(1);
  const [mapLocations, setMapLocations] = useState<LocationData[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(true);

  // UI state
  const [allCachesData, setAllCachesData] =
    useState<GetAllActiveUserIdsResponse | null>(null);

  // Rotation speed state (degrees per second), default 1
  const [rotationSpeed, setRotationSpeed] = useState(1);

  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  // Update map data based on precision
  const updateMapData = useCallback(
    (data: GetAllActiveUserIdsResponse | null, precision: string) => {
      if (!data) return;
      if (data.caches[precision]?.locations) {
        const locationsArray = Object.entries(
          data.caches[precision].locations
        ).map(([key, location]) => ({
          key,
          providers: location.providers || [],
          latitude: location.latitude,
          longitude: location.longitude,
        }));
        setMapLocations(locationsArray);
      } else {
        setMapLocations([]);
      }
    },
    []
  );

  const fetchLocations = async () => {
    try {
      const response = await api.fetch(`/api/grpc/location/active-user-ids`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch location data");
      }
      const data: GetAllActiveUserIdsResponse = await response.json();
      setAllCachesData(data);
      updateMapData(data, mapPrecision.toString());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch location data",
        description: (error as Error).message,
      });
    }
  };

  // Handle map zoom changes
  const handleMapZoomChange = useCallback(
    (precision: string) => {
      const precisionNum = parseInt(precision);
      setMapPrecision(precisionNum);
      if (allCachesData) {
        updateMapData(allCachesData, precision);
      }
    },
    [allCachesData, updateMapData]
  );

  // Toggle fullscreen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Initial data fetch and set up auto-refresh
  useEffect(() => {
    fetchLocations();
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchLocations();
    }, 5000);
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [currentEnvironment]);

  // Update map data when allCachesData changes or mapPrecision changes
  useEffect(() => {
    if (allCachesData) {
      updateMapData(allCachesData, mapPrecision.toString());
    }
  }, [allCachesData, mapPrecision, updateMapData]);

  // Handlers for slider and input
  const handleSliderChange = (value: number[]) => {
    setRotationSpeed(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(360, value));
    setRotationSpeed(value);
  };

  return (
    <motion.div
      className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-50 bg-white" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`bg-white rounded-lg shadow-md ${isFullScreen ? "h-full" : "p-6"}`}
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {allCachesData && (
          <div className="w-full relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>

            {/* Rotation Speed Controls - hidden in fullscreen */}
            {!isFullScreen && (
              <div className="mb-6 pt-6">
                <label
                  htmlFor="rotationSpeedSlider"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Globe Rotation Speed
                  <span className="ml-2 text-xs text-gray-500">
                    (degrees per second)
                  </span>
                </label>
                <div className="flex items-center gap-4 w-full">
                  <Slider
                    id="rotationSpeedSlider"
                    min={0}
                    max={360}
                    step={1}
                    value={[rotationSpeed]}
                    onValueChange={handleSliderChange}
                    className="flex-1"
                    aria-label="Rotation Speed"
                  />
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={rotationSpeed}
                    onChange={handleInputChange}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-right"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between w-full">
                  <span>0</span>
                  <span>360</span>
                </div>
              </div>
            )}

            <LocationMap
              locations={mapLocations}
              currentPrecision={mapPrecision}
              onZoomChange={handleMapZoomChange}
              isFullScreen={isFullScreen}
              rotationSpeed={rotationSpeed}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
