// app/dashboard/analytics/call-history-analytics/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { subDays } from "date-fns";
import {
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
  FilterIcon,
  Users,
  LineChart,
} from "lucide-react"; // Added FilterIcon, Users, LineChart
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Added Card components
import { CallHistoryAnalyticsDashboard } from "@/components/AnalyticsDashboard/CallHistoryAnalyticsDashboard";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import {
  dateToProtoTimestamp,
  formatDuration as formatDurationUtil,
} from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

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

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false);

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchCallTimeData = useCallback(
    async (currentDateRange?: DateRange) => {
      const targetDateRange = currentDateRange || dateRange;
      if (!targetDateRange?.from || !targetDateRange?.to) {
        toast({
          variant: "destructive",
          title: "Date range required",
          description: "Please select both start and end dates",
        });
        return;
      }

      setLoading(true);
      try {
        const startTimestamp = dateToProtoTimestamp(targetDateRange.from);
        const endTimestamp = dateToProtoTimestamp(targetDateRange.to);

        if (!startTimestamp || !endTimestamp) {
          toast({ variant: "destructive", title: "Invalid date range" });
          setLoading(false);
          return;
        }

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
        setUserCallTimes([]); // Clear data on error
        setFilteredData([]);
      } finally {
        setLoading(false);
        setIsFiltersSheetOpen(false); // Close sheet after applying filters
      }
    },
    [api, dateRange, toast]
  ); // dateRange is a dependency for the callback itself

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchCallTimeData(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnvironment]); // Only run on environment change or initial load with default dateRange

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
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
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

  const handleApplyFiltersFromSheet = () => {
    fetchCallTimeData(dateRange); // Use current dateRange state
  };

  return (
    <ProtectedRoute
      allowedRoutes={[
        "/dashboard/analytics",
        "/dashboard/analytics/call-history-analytics",
      ]}
    >
      <motion.div
        className="space-y-6 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="shadow-xl border-none rounded-xl">
          <CardHeader className="pb-0 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Users className="mr-3 h-7 w-7 text-primary" />
              User Call Time Analytics
            </CardTitle>
            <CardDescription className="text-slate-600">
              Analyze call time data for users within a selected date range.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filter Section - Button for Mobile, Inline for Desktop */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Desktop Date Range Picker and Search Button */}
              <div className="hidden md:flex md:items-end md:gap-4">
                <div>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateChange={setDateRange}
                    className="h-12"
                  />
                </div>
                <Button
                  onClick={() => fetchCallTimeData(dateRange)}
                  className="h-12 bg-primary hover:bg-primary/90 text-white"
                  disabled={loading || !dateRange?.from || !dateRange?.to}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>

              {/* Mobile Filter Trigger Button */}
              <div className="md:hidden w-full">
                <Sheet
                  open={isFiltersSheetOpen}
                  onOpenChange={setIsFiltersSheetOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-center text-slate-700 border-slate-300 hover:bg-slate-100"
                    >
                      <FilterIcon className="mr-2 h-4 w-4" />
                      Filters & Date Range
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl p-0">
                    <SheetHeader className="p-6 pb-4 border-b">
                      <SheetTitle className="text-lg">
                        Filters & Date
                      </SheetTitle>
                      <SheetDescription>
                        Select a date range and apply filters.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-150px)]">
                      <div>
                        <Label
                          htmlFor="date-range-picker-mobile"
                          className="text-sm font-medium text-slate-700 mb-1 block"
                        >
                          Date Range
                        </Label>
                        <DateRangePicker
                          dateRange={dateRange}
                          onDateChange={setDateRange}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="userIdFilterMobile"
                          className="text-sm font-medium text-slate-700 mb-1 block"
                        >
                          Filter by User ID
                        </Label>
                        <Input
                          id="userIdFilterMobile"
                          placeholder="Enter User ID"
                          value={userIdFilter}
                          onChange={(e) => setUserIdFilter(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="userNameFilterMobile"
                          className="text-sm font-medium text-slate-700 mb-1 block"
                        >
                          Filter by User Name
                        </Label>
                        <Input
                          id="userNameFilterMobile"
                          placeholder="Enter User Name"
                          value={userNameFilter}
                          onChange={(e) => setUserNameFilter(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <SheetFooter className="p-6 border-t">
                      <SheetClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          Cancel
                        </Button>
                      </SheetClose>
                      <Button
                        onClick={handleApplyFiltersFromSheet}
                        className="w-full sm:w-auto"
                        disabled={loading || !dateRange?.from || !dateRange?.to}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="mr-2 h-4 w-4" />
                        )}
                        Apply Filters
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Filters */}
              <div className="hidden md:flex md:gap-4 md:items-end">
                <div>
                  <Label
                    htmlFor="userIdFilterDesktop"
                    className="text-sm font-medium text-slate-700 mb-1 block"
                  >
                    Filter by User ID
                  </Label>
                  <Input
                    id="userIdFilterDesktop"
                    placeholder="User ID"
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="userNameFilterDesktop"
                    className="text-sm font-medium text-slate-700 mb-1 block"
                  >
                    Filter by User Name
                  </Label>
                  <Input
                    id="userNameFilterDesktop"
                    placeholder="User Name"
                    value={userNameFilter}
                    onChange={(e) => setUserNameFilter(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto bg-white">
                <Table className="min-w-full">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        User ID
                      </TableHead>
                      <TableHead className="px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        User Name
                      </TableHead>
                      <TableHead className="px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("numberOfCalls")}
                          className="px-0 hover:bg-slate-200"
                        >
                          # Calls{" "}
                          {sortField === "numberOfCalls" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="ml-2 h-3 w-3 text-blue-500" />
                          ) : (
                            <ArrowDown className="ml-2 h-3 w-3 text-blue-500" />
                          )
                          ) : (
                          <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                        <TableHead className="px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("totalCallTime")}
                          className="px-0 hover:bg-slate-200"
                        >
                          Total Time{" "}
                          {sortField === "totalCallTime" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="ml-2 h-3 w-3 text-blue-500" />
                          ) : (
                            <ArrowDown className="ml-2 h-3 w-3 text-blue-500" />
                          )
                          ) : (
                          <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                        </TableHead>
                        <TableHead className="px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("callTimeAsProvider")}
                          className="px-0 hover:bg-slate-200"
                        >
                          Provider Time{" "}
                          {sortField === "callTimeAsProvider" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="ml-2 h-3 w-3 text-blue-500" />
                          ) : (
                            <ArrowDown className="ml-2 h-3 w-3 text-blue-500" />
                          )
                          ) : (
                          <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                        </TableHead>
                        <TableHead className="px-6 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("callTimeAsConsumer")}
                          className="px-0 hover:bg-slate-200"
                        >
                          Consumer Time{" "}
                          {sortField === "callTimeAsConsumer" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="ml-2 h-3 w-3 text-blue-500" />
                          ) : (
                            <ArrowDown className="ml-2 h-3 w-3 text-blue-500" />
                          )
                          ) : (
                          <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                        </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((user) => (
                        <TableRow
                          key={user.userId}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell className="px-6 py-2 whitespace-nowrap text-sm text-slate-700">
                            {user.userId}
                          </TableCell>
                          <TableCell className="px-6 py-2 whitespace-nowrap text-sm font-medium text-slate-900">
                            {user.userName}
                          </TableCell>
                          <TableCell className="px-6 py-2 whitespace-nowrap text-sm text-slate-700">
                            {user.numberOfCalls}
                          </TableCell>
                          <TableCell className="px-6 py-2 whitespace-nowrap text-sm text-slate-700">
                            {formatDurationUtil(user.totalCallTime)}
                          </TableCell>
                          <TableCell className="px-6 py-2 whitespace-nowrap text-sm text-slate-700">
                            {formatDurationUtil(user.callTimeAsProvider)}
                          </TableCell>
                          <TableCell className="px-6 py-2 whitespace-nowrap text-sm text-slate-700">
                            {formatDurationUtil(user.callTimeAsConsumer)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-slate-500"
                        >
                          No data available for the selected criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-none rounded-xl mt-8">
          <CardHeader className="pb-0 rounded-t-xl">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <LineChart className="mr-3 h-6 w-6 text-primary" />
              Call Time Distribution
            </CardTitle>
            <CardDescription className="text-slate-600">
              Visual representation of call time data for the filtered users.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!loading && filteredData.length > 0 ? (
              <CallHistoryAnalyticsDashboard
                data={filteredData}
                formatTime={formatDurationUtil}
              />
            ) : !loading &&
              userCallTimes.length > 0 &&
              filteredData.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No users match the current filter criteria for the chart.
              </div>
            ) : !loading && userCallTimes.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No call data available to display charts.
              </div>
            ) : null}
            {loading && (
             <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </ProtectedRoute>
  );
}
