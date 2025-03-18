// app/dashboard/location/active-user-ids/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, MapPin, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface LocationData {
  key: string;
  providerIds: string[];
  latitude: number;
  longitude: number;
}

interface GetAllActiveUserIdsResponse {
  caches: Record<string, {
    locations: Record<string, {
      latitude: number;
      longitude: number;
      providerIds: string[];
    }>
  }>;
}

export default function ActiveUserIds() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState("1");
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(5);
  const [allCachesData, setAllCachesData] = useState<GetAllActiveUserIdsResponse | null>(null);
  
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
        throw new Error(errorData.message || 'Failed to fetch location data');
      }
      
      const data: GetAllActiveUserIdsResponse = await response.json();
      setAllCachesData(data);
      
      // Get available pages from cache keys
      const pages = Object.keys(data.caches || {}).sort((a, b) => parseInt(a) - parseInt(b));
      setAvailablePages(pages);
      
      // If current page doesn't exist in available pages, set to first page
      if (pages.length > 0 && !pages.includes(currentPage)) {
        setCurrentPage(pages[0]);
      }
      
      updateLocationsForCurrentPage(data, currentPage);
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

  const updateLocationsForCurrentPage = (data: GetAllActiveUserIdsResponse | null, page: string) => {
    if (!data) return;
    
    // Transform the data for the current page into an array format for the table
    if (data.caches[page]?.locations) {
      const locationsArray = Object.entries(data.caches[page].locations).map(([key, location]) => ({
        key,
        ...location,
        // Convert providerIds to strings if they aren't already
        providerIds: location.providerIds.map(id => id.toString())
      }));
      
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
      setTimeUntilRefresh(5);
      
      // Set up timer countdown
      timerIntervalRef.current = setInterval(() => {
        setTimeUntilRefresh(prev => {
          if (prev <= 1) {
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set up data refresh
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchLocations();
      }, 5000);
      
      // Show toast notification
      toast({
        title: "Auto-refresh enabled",
        description: "Data will refresh every 5 seconds",
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
  }, [autoRefresh]);

  const handleRefresh = () => {
    fetchLocations();
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
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
          <motion.div 
            className="flex flex-col md:flex-row md:items-center justify-between mb-6"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Active User IDs
              </h1>
              <p className="text-gray-500">
                View active users and their location data
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-0">
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Switch 
                  id="auto-refresh" 
                  checked={autoRefresh} 
                  onCheckedChange={toggleAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm font-medium flex items-center">
                  Auto-refresh
                  {autoRefresh && (
                    <motion.div 
                      className="ml-2 flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      <motion.span
                        key={timeUntilRefresh}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {timeUntilRefresh}s
                      </motion.span>
                    </motion.div>
                  )}
                </Label>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {loading && !refreshing ? (
            <motion.div 
              className="flex justify-center items-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </motion.div>
          ) : locations.length > 0 ? (
            <>
              <motion.div 
                className="overflow-x-auto rounded-lg border overflow-y-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Provider IDs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Latitude
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Longitude
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence mode="wait">
                      {locations.map((location, index) => (
                        <motion.tr 
                          key={location.key || index} 
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {location.key}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-h-80 overflow-y-auto">
                              {location.providerIds.map((id, idx) => (
                                <motion.div 
                                  key={idx} 
                                  className="mb-1 last:mb-0"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + idx * 0.02 }}
                                >
                                  {id}
                                </motion.div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {location.latitude.toFixed(6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {location.longitude.toFixed(6)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
              
              <motion.div 
                className="mt-6 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-sm text-gray-500">
                  Cache {currentPage} of {availablePages.length}
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentIndex = availablePages.indexOf(currentPage);
                        if (currentIndex > 0) {
                          handlePageChange(availablePages[currentIndex - 1]);
                        }
                      }}
                      disabled={currentPage === availablePages[0] || availablePages.length === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  
                  {availablePages.map(page => (
                    <motion.div 
                      key={page}
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant={currentPage === page ? "outline" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? "relative text-white" : ""}
                      >
                        {currentPage === page && (
                          <motion.span
                            className="absolute inset-0 bg-blue-400 rounded-md"
                            layoutId="activePage"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10">{page}</span>
                      </Button>
                    </motion.div>
                  ))}
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentIndex = availablePages.indexOf(currentPage);
                        if (currentIndex < availablePages.length - 1) {
                          handlePageChange(availablePages[currentIndex + 1]);
                        }
                      }}
                      disabled={currentPage === availablePages[availablePages.length - 1] || availablePages.length === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="text-center py-12 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <motion.p 
                className="text-gray-500"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                No location data available.
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </ProtectedRoute>
  );
}
