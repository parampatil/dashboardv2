// components/AnalyticsDashboard/CallHistoryTableComponent.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedCallTransactionDetails } from "@/types/callHistoryTable";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CopyTooltip from "@/components/ui/CopyToolTip";

interface CallHistoryTableComponentProps {
  callDetails: FormattedCallTransactionDetails[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  pageRecords: string;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  onRefresh?: () => void;
}

// Define all possible columns
const allColumns = [
  { id: "callId", name: "Call ID" },
  { id: "createdAt", name: "Created At" },
  { id: "consumer", name: "Consumer" },
  { id: "provider", name: "Provider" },
  { id: "callStatus", name: "Status" },
  { id: "callDuration", name: "Duration" },
  { id: "charge", name: "Charge" },
  { id: "context", name: "Context" },
  { id: "location", name: "Location" },
];

export function CallHistoryTableComponent({
  callDetails,
  loading,
  pageNumber,
  pageSize,
  totalPages,
  pageRecords,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  sortOrder,
  onSortOrderChange,
  onRefresh,
}: CallHistoryTableComponentProps) {
  // State for visible columns
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.map((col) => col.id)
  );

  // State for auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(refreshInterval);

  // Handle column visibility toggle
  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastRefreshed(new Date());
      setRefreshCountdown(refreshInterval);
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  // Update refresh interval
  const handleRefreshIntervalChange = (value: string) => {
    const interval = parseInt(value);
    setRefreshInterval(interval);
    setRefreshCountdown(interval);

    // Reset the timer with new interval
    if (autoRefresh && refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = setInterval(handleRefresh, interval * 1000);
    }
  };

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && onRefresh) {
      refreshTimerRef.current = setInterval(
        handleRefresh,
        refreshInterval * 1000
      );

      // Countdown timer
      const countdownTimer = setInterval(() => {
        setRefreshCountdown((prev) => {
          if (prev <= 1) return refreshInterval;
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        clearInterval(countdownTimer);
      };
    } else if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Format status badge
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "session_started":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "session_ended":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "call_missed":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "call_created":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "call_rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-wrap justify-between items-center gap-2"
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Showing {pageRecords} of {totalRecords} calls
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-refresh controls */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={autoRefresh ? "default" : "outline"}
                    size="sm"
                    onClick={toggleAutoRefresh}
                    className="relative"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {autoRefresh ? "Auto" : "Manual"}
                    {autoRefresh && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {refreshCountdown}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {autoRefresh && (
            <Select
              value={String(refreshInterval)}
              onValueChange={handleRefreshIntervalChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5s</SelectItem>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Manual refresh button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-1 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last refreshed: {format(lastRefreshed, "HH:mm:ss")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Column visibility dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                >
                  {column.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort order button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              {sortOrder === "asc" ? "Oldest First" : "Newest First"}
            </Button>
          </motion.div>

          {/* Page size selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">Show:</span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="rounded-md border overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {allColumns.map(
                (column) =>
                  visibleColumns.includes(column.id) && (
                    <TableHead key={column.id}>{column.name}</TableHead>
                  )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <motion.div
                      className="h-6 w-6 border-b-2 border-gray-900 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : callDetails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No call records found
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="wait">
                {callDetails.map((call, index) => (
                  <motion.tr
                    key={call.callId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-gray-50 overflow-hidden"
                  >
                    {visibleColumns.includes("callId") && (
                      <TableCell
                        className="font-medium max-w-40"
                        title={call.callId}
                      >
                        {call.callId}
                      </TableCell>
                    )}

                    {visibleColumns.includes("createdAt") && (
                      <TableCell>{call.createdAt}</TableCell>
                    )}

                    {visibleColumns.includes("consumer") && (
                      <TableCell>
                        <CopyTooltip
                          prefix="User ID:"
                          content={call.consumerId}
                          triggerContent={call.consumerName || "Unknown"}
                        />
                      </TableCell>
                    )}

                    {visibleColumns.includes("provider") && (
                      <TableCell>
                        <CopyTooltip
                          prefix="User ID:"
                          content={call.providerId}
                          triggerContent={call.providerName || "Unknown"}
                        />
                      </TableCell>
                    )}

                    {visibleColumns.includes("callStatus") && (
                      <TableCell>
                        <Badge className={getStatusBadgeClass(call.callStatus)}>
                          {formatStatus(call.callStatus)}
                        </Badge>
                      </TableCell>
                    )}

                    {visibleColumns.includes("callDuration") && (
                      <TableCell>{call.callDuration}</TableCell>
                    )}

                    {visibleColumns.includes("charge") && (
                      <TableCell>{call.charge}</TableCell>
                    )}

                    {visibleColumns.includes("context") && (
                      <TableCell>{call.context || "N/A"}</TableCell>
                    )}

                    {visibleColumns.includes("location") && (
                      <TableCell>{call.location || "N/A"}</TableCell>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <motion.div
        className="flex justify-between items-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="text-sm text-gray-500">
          Page {pageNumber} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
