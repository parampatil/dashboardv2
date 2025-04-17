"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { LocationData, GetAllActiveUserIdsResponse } from "@/types/location";
import LocationMap from "@/components/LocationDashboard/LocationMap";
import MenuOptions from "@/components/LocationDashboard/MenuOptions";
import ActiveUserIdsTable from "@/components/LocationDashboard/ActiveUserIdsTable";

export type LayoutMode = "stacked" | "sideBySide";

export default function ActiveUserIds() {
  // Table and map data state
  const [tablePage, setTablePage] = useState("1");
  const [mapPrecision, setMapPrecision] = useState(1);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [mapLocations, setMapLocations] = useState<LocationData[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(5);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [allCachesData, setAllCachesData] =
    useState<GetAllActiveUserIdsResponse | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("sideBySide");

  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchLocations = async () => {
    setRefreshing(true);
    try {
      const response = await api.fetch(`/api/grpc/location/active-user-ids`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch location data");
      }

      const data: GetAllActiveUserIdsResponse = await response.json();
      setAllCachesData(data);

      // Get available pages from cache keys
      const pages = Object.keys(data.caches || {}).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
      setAvailablePages(pages);

      // If current page doesn't exist in available pages, set to first page
      if (pages.length > 0 && !pages.includes(tablePage)) {
        setTablePage(pages[0]);
      }

      // Update table and map data
      updateTableData(data, tablePage);
      updateMapData(data, mapPrecision.toString());

      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 1000); // Reset after 1 second
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch location data",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update table data based on selected page
  const updateTableData = useCallback(
    (data: GetAllActiveUserIdsResponse | null, page: string) => {
      if (!data) return;

      if (data.caches[page]?.locations) {
        const locationsArray = Object.entries(data.caches[page].locations).map(
          ([key, location]) => ({
            key,
            providers: location.providers || [],
            latitude: location.latitude,
            longitude: location.longitude,
          })
        );

        setLocations(locationsArray);
      } else {
        setLocations([]);
      }
    },
    []
  );

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

  // Handle map zoom changes - updates both map and table
  const handleMapZoomChange = useCallback(
    (precision: string) => {
      const precisionNum = parseInt(precision);
      setMapPrecision(precisionNum);

      // Only update table page if the precision is available in the data
      if (availablePages.includes(precision)) {
        setTablePage(precision);
      }

      // Update map data
      if (allCachesData) {
        updateMapData(allCachesData, precision);
      }
    },
    [availablePages, allCachesData, updateMapData]
  );

  // Handle table page changes - only updates the table
  const handleTablePageChange = useCallback(
    (page: string) => {
      setTablePage(page);

      // Update table data only
      if (allCachesData) {
        updateTableData(allCachesData, page);
      }
    },
    [allCachesData, updateTableData]
  );

  // Initial data fetch
  useEffect(() => {
    fetchLocations();

    // Cleanup function
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentEnvironment]);

  // Update table data when page changes
  useEffect(() => {
    if (allCachesData) {
      updateTableData(allCachesData, tablePage);
    }
  }, [tablePage, allCachesData, updateTableData]);

  // Update map data when allCachesData changes or mapPrecision changes
  useEffect(() => {
    if (allCachesData) {
      updateMapData(allCachesData, mapPrecision.toString());
    }
  }, [allCachesData, mapPrecision, updateMapData]);

  // Handle auto-refresh toggle
  useEffect(() => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (autoRefresh) {
      setTimeUntilRefresh(refreshInterval);

      // Set up timer countdown
      timerIntervalRef.current = setInterval(() => {
        setTimeUntilRefresh((prev) => {
          if (prev <= 1) {
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);

      // Set up data refresh with custom interval
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchLocations();
      }, refreshInterval * 1000);

      // Show toast notification
      toast({
        title: "Auto-refresh enabled",
        description: `Data will refresh every ${refreshInterval} seconds`,
        duration: 3000,
      });
    } else if (autoRefreshIntervalRef.current) {
      // Only show toast if we're disabling an active auto-refresh
      toast({
        title: "Auto-refresh disabled",
        duration: 3000,
      });
    }

    // Cleanup function
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/location/active-user-ids"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MenuOptions
            loading={loading}
            refreshing={refreshing}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            refreshInterval={refreshInterval}
            setRefreshInterval={setRefreshInterval}
            timeUntilRefresh={timeUntilRefresh}
            onRefresh={fetchLocations}
            refreshSuccess={refreshSuccess}
            availablePages={availablePages}
            currentPage={tablePage}
            onPageChange={handleTablePageChange}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />

          {allCachesData && (
            <div
              className={`flex ${
                layoutMode === "stacked" ? "flex-col" : "flex-col lg:flex-row"
              } gap-6`}
            >
              <div
                className={layoutMode === "sideBySide" ? "flex-1" : "w-full"}
              >
                <LocationMap
                  locations={mapLocations}
                  currentPrecision={mapPrecision}
                  onZoomChange={handleMapZoomChange}
                  layoutMode={layoutMode}
                />
              </div>
              <div
                className={layoutMode === "sideBySide" ? "flex-1" : "w-full"}
              >
                <ActiveUserIdsTable
                  loading={loading}
                  refreshing={refreshing}
                  locations={locations}
                  availablePages={availablePages}
                  currentPage={tablePage}
                  onPageChange={handleTablePageChange}
                  layoutMode={layoutMode}
                />
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}
