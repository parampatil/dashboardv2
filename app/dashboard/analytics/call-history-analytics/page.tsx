// app/dashboard/analytics/call-history-analytics/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CallHistoryAnalyticsDashboard } from "@/components/AnalyticsDashboard/CallHistoryAnalyticsDashboard";

interface UserCallTime {
  userId: number;
  userName: string;
  numberOfCalls: number;
  totalCallTime: number;
  callTimeAsProvider: number;
  callTimeAsConsumer: number;
}

type SortField =
  | "numberOfCalls"
  | "totalCallTime"
  | "callTimeAsProvider"
  | "callTimeAsConsumer";
type SortDirection = "asc" | "desc";

export default function CallHistoryAnalytics() {
  const [userCallTimes, setUserCallTimes] = useState<UserCallTime[]>([]);
  const [filteredData, setFilteredData] = useState<UserCallTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [userNameFilter, setUserNameFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  });
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchCallTimeData = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Date range required",
        description: "Please select both start and end dates",
      });
      return;
    }

    setLoading(true);
    try {
      const startTimestamp = {
        seconds: Math.floor(startDate.getTime() / 1000),
        nanos: (startDate.getTime() % 1000) * 1000000,
      };

      const endTimestamp = {
        seconds: Math.floor(endDate.getTime() / 1000),
        nanos: (endDate.getTime() % 1000) * 1000000,
      };

      const response = await api.fetch(
        "/api/grpc/analytics/call-history-analytics",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime: startTimestamp,
            endTime: endTimestamp,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error?.details ||
            data.message ||
            "Failed to fetch call time data"
        );
      }

      setUserCallTimes(data.userCallTime || []);
      setFilteredData(data.userCallTime || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch call time data",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallTimeData();
  }, [currentEnvironment]);

  useEffect(() => {
    const filtered = userCallTimes.filter((item) => {
      const matchesUserId = userIdFilter
        ? item.userId.toString().includes(userIdFilter)
        : true;
      const matchesUserName = userNameFilter
        ? item.userName.toLowerCase().includes(userNameFilter.toLowerCase())
        : true;
      return matchesUserId && matchesUserName;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    setFilteredData(filtered);
  }, [userIdFilter, userNameFilter, userCallTimes, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(0);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      setStartDate(newDate);
    } else {
      setStartDate(undefined);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(23, 59, 59, 999);
      setEndDate(newDate);
    } else {
      setEndDate(undefined);
    }
  };

  return (
    <ProtectedRoute
      allowedRoutes={["/dashboard/analytics/call-history-analytics"]}
    >
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Call History Analytics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchCallTimeData}
                className="w-full"
                disabled={loading || !startDate || !endDate}
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Input
                placeholder="Filter by User ID"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                placeholder="Filter by User Name"
                value={userNameFilter}
                onChange={(e) => setUserNameFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("numberOfCalls")}
                        className="flex items-center"
                      >
                        Number of Calls
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("totalCallTime")}
                        className="flex items-center"
                      >
                        Total Call Time
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("callTimeAsProvider")}
                        className="flex items-center"
                      >
                        Call Time as Provider
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("callTimeAsConsumer")}
                        className="flex items-center"
                      >
                        Call Time as Consumer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>{user.userName}</TableCell>
                        <TableCell>{user.numberOfCalls}</TableCell>
                        <TableCell>{formatTime(user.totalCallTime)}</TableCell>
                        <TableCell>
                          {formatTime(user.callTimeAsProvider)}
                        </TableCell>
                        <TableCell>
                          {formatTime(user.callTimeAsConsumer)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {!loading && filteredData.length > 0 && (
            <CallHistoryAnalyticsDashboard
              data={filteredData}
              formatTime={formatTime}
            />
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
