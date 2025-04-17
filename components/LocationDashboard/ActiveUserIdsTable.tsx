"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyTooltip from "@/components/ui/CopyToolTip";
import { LocationData } from "@/types/location";
import { type LayoutMode } from "@/app/dashboard/location/active-user-ids/page";

interface ActiveUserIdsTableProps {
  loading: boolean;
  refreshing: boolean;
  locations: LocationData[];
  availablePages: string[];
  currentPage: string;
  onPageChange: (page: string) => void;
  layoutMode: LayoutMode;
}

export default function ActiveUserIdsTable({
  loading,
  refreshing,
  locations,
  availablePages,
  currentPage,
  onPageChange,
  layoutMode,
}: ActiveUserIdsTableProps) {
  // Hide the key column when in side-by-side layout
  const showKeyColumn = layoutMode !== "sideBySide";

  return (
    <>
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
                  {showKeyColumn && (
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Key
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Provider Names
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence mode="wait">
                  {locations.map((location, index) => (
                    <motion.tr
                      key={location.key || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                    >
                      {showKeyColumn && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {location.key}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-h-80 flex flex-col">
                          {location.providers.map((provider, idx) => (
                            <CopyTooltip
                              key={idx}
                              prefix="Provider ID:"
                              content={provider.id}
                              triggerContent={provider.name}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-col items-center justify-between space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentIndex = availablePages.indexOf(currentPage);
                    if (currentIndex > 0) {
                      onPageChange(availablePages[currentIndex - 1]);
                    }
                  }}
                  disabled={
                    currentPage === availablePages[0] ||
                    availablePages.length === 0
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>

              {availablePages.map((page) => (
                <motion.div
                  key={page}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant={currentPage === page ? "outline" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={
                      currentPage === page ? "relative text-white" : ""
                    }
                  >
                    {currentPage === page && (
                      <motion.span
                        className="absolute inset-0 bg-blue-400 rounded-md"
                        layoutId="activePage"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
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
                      onPageChange(availablePages[currentIndex + 1]);
                    }
                  }}
                  disabled={
                    currentPage === availablePages[availablePages.length - 1] ||
                    availablePages.length === 0
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <div className="text-sm text-gray-500">
              Cache {currentPage} of {availablePages.length}
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
    </>
  );
}
