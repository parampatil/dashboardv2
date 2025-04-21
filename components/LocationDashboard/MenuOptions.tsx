import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Clock, LayoutGrid, Columns, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type LayoutMode } from "@/app/dashboard/location/active-user-ids/page";

interface MenuOptionsProps {
  loading: boolean;
  refreshing: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (value: number) => void;
  timeUntilRefresh: number;
  onRefresh: () => void;
  refreshSuccess: boolean;
  availablePages: string[];
  currentPage: string;
  onPageChange: (page: string) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  totalActiveUsers?: number;
}

export const PingDot = ({ refreshSuccess }: { refreshSuccess: boolean }) => {
  return (
    <AnimatePresence>
      <motion.span
        className="relative flex h-3 w-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: refreshSuccess ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.span
          className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400/10 opacity-75"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: refreshSuccess ? 1 : 0,
            opacity: refreshSuccess ? 0.75 : 0,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        ></motion.span>
        <motion.span
          className="relative inline-flex rounded-full h-3 w-3 bg-green-500"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: refreshSuccess ? 1 : 0,
            opacity: refreshSuccess ? 1 : 0,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        ></motion.span>
      </motion.span>
    </AnimatePresence>
  );
};

export default function MenuOptions({
  loading,
  refreshing,
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval,
  timeUntilRefresh,
  onRefresh,
  refreshSuccess,
  layoutMode,
  setLayoutMode,
  totalActiveUsers = 0,
}: MenuOptionsProps) {
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  const handleRefreshIntervalChange = (value: string) => {
    // Ensure value is at least 1 second
    const newValue = Math.max(1, parseInt(value, 10) || 1);
    setRefreshInterval(newValue);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row md:items-center justify-between mb-6"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Active User IDs
          </h1>
          {totalActiveUsers > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Badge className="text-sm py-1.5 px-2.5 bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <motion.span
                  key={totalActiveUsers}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {totalActiveUsers} Active Users
                </motion.span>
              </Badge>
            </motion.div>
          )}
        </div>
        <p className="text-gray-500">
          View active users and their location data
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <ToggleGroup
                  type="single"
                  value={layoutMode}
                  onValueChange={(value) =>
                    value && setLayoutMode(value as LayoutMode)
                  }
                >
                  <ToggleGroupItem value="stacked" aria-label="Stacked layout">
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="sideBySide"
                    aria-label="Side-by-side layout"
                  >
                    <Columns className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle layout mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Switch
            id="auto-refresh"
            checked={autoRefresh}
            onCheckedChange={() => {
              toggleAutoRefresh();
              setShowTimeSelector(!autoRefresh);
            }}
          />
          <Label
            htmlFor="auto-refresh"
            className="text-sm font-medium flex items-center"
          >
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

        {/* Time selector */}
        <AnimatePresence>
          {(showTimeSelector || autoRefresh) && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-2"
            >
              <Label
                htmlFor="refresh-interval"
                className="text-sm whitespace-nowrap"
              >
                Refresh every:
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="refresh-interval"
                  type="number"
                  min={1}
                  value={refreshInterval}
                  onChange={(e) => handleRefreshIntervalChange(e.target.value)}
                  className="w-16 h-8 text-sm focus:!ring-0"
                />
                <span className="text-sm">seconds</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
            <PingDot refreshSuccess={refreshSuccess} />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
