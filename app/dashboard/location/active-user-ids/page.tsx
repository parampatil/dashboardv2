// app/dashboard/location/active-user-ids/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { LocationData, GetAllActiveUserIdsResponse } from "@/types/location";
import LocationMap from "@/components/LocationDashboard/LocationMap";
import MenuOptions from "@/components/LocationDashboard/MenuOptions";
import ActiveUserIdsTable from "@/components/LocationDashboard/ActiveUserIdsTable";

export default function ActiveUserIds() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState("1");
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(5);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [allCachesData, setAllCachesData] =
    useState<GetAllActiveUserIdsResponse | null>(null);

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
      if (pages.length > 0 && !pages.includes(currentPage)) {
        setCurrentPage(pages[0]);
      }

      updateLocationsForCurrentPage(data, currentPage);
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

  const updateLocationsForCurrentPage = (
    data: GetAllActiveUserIdsResponse | null,
    page: string
  ) => {
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
  };

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

  // Update locations when page changes
  useEffect(() => {
    updateLocationsForCurrentPage(allCachesData, currentPage);
  }, [currentPage, allCachesData]);

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

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

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
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />

          <ActiveUserIdsTable
            loading={loading}
            refreshing={refreshing}
            locations={locations}
            availablePages={availablePages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </motion.div>

        {allCachesData?.caches && <LocationMap caches={allCachesData.caches} />}
      </motion.div>
    </ProtectedRoute>
  );
}
