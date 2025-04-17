// app/dashboard/sales/sales-analytics/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  Phone,
  Clock,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Import chart components
import CallTimeLineChart from "@/components/charts/CallTimeLineChart";
import ConsumerPurchasePieChart from "@/components/charts/ConsumerPurchasePieChart";
import ProviderEarningsPieChart from "@/components/charts/ProviderEarningsPieChart";

// Types
import { 
  UserCallAnalytics, 
  ConsumerPurchaseAnalytics, 
  ProviderAnalytics,
} from "@/types/analytics";

export default function SalesAnalytics() {
  const [userId, setUserId] = useState<string>("0"); // Default to 0 for all records
  const [analytics, setAnalytics] = useState<UserCallAnalytics | null>(null);
  const [consumerPurchase, setConsumerPurchase] =
    useState<ConsumerPurchaseAnalytics | null>(null);
  const [providerEarnings, setProviderEarnings] =
    useState<ProviderAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = subDays(new Date(), 30);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  });

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchAnalytics = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
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
      
      // Fetch user call analytics
      const callAnalyticsResponse = await api.fetch(
        "/api/grpc/sales/user-call-analytics",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: parseInt(userId),
            startTimestamp,
            endTimestamp,
          }),
        }
      );

      const callAnalyticsData = await callAnalyticsResponse.json();
      if (!callAnalyticsResponse.ok) {
        throw new Error(
          callAnalyticsData.error?.details ||
            callAnalyticsData.message ||
            "Failed to fetch user call analytics"
        );
      }
      setAnalytics(callAnalyticsData);

      // Fetch consumer purchase analytics
      const purchaseResponse = await api.fetch(
        "/api/grpc/sales/total-purchase-amount",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: startTimestamp,
            endDate: endTimestamp,
          }),
        }
      );

      const purchaseData = await purchaseResponse.json();
      if (!purchaseResponse.ok) {
        throw new Error(
          purchaseData.error?.details ||
            purchaseData.message ||
            "Failed to fetch consumer purchase analytics"
        );
      }
      setConsumerPurchase(purchaseData);

      // Fetch provider earnings
      const earningsResponse = await api.fetch(
        "/api/grpc/sales/provider-analytics",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: startTimestamp,
            endDate: endTimestamp,
          }),
        }
      );

      const earningsData = await earningsResponse.json();
      if (!earningsResponse.ok) {
        throw new Error(
          earningsData.error?.details ||
            earningsData.message ||
            "Failed to fetch provider earnings"
        );
      }
      setProviderEarnings(earningsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch analytics",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentEnvironment]);

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/sales/sales-analytics"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Sales Analytics
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID (Optional)</label>
              <Input
                type="number"
                placeholder="Enter user ID (0 for all)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

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
                onClick={fetchAnalytics}
                className="w-full"
                disabled={loading || !startDate || !endDate}
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Loading..." : "Fetch Analytics"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Call Analytics */}
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Calls
                        </CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics.totalCalls}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Call Time
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatTime(analytics.totalCallTime)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Average Call Time
                        </CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatTime(analytics.averageCallTime)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Call Time Analytics Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <CallTimeLineChart callStatsPerDay={analytics.callStatsPerDay || []} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Analytics Cards with Pie Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Consumer Purchase Analytics Card */}
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle>Consumer Purchase Analytics</CardTitle>
                    <div className="text-sm text-gray-500">
                      {startDate && endDate
                        ? `${format(startDate, "PPP")} - ${format(
                            endDate,
                            "PPP"
                          )}`
                        : "Select a date range"}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ConsumerPurchasePieChart data={consumerPurchase} />
                  </CardContent>
                </Card>

                {/* Provider Earnings Analytics Card */}
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle>Provider Earnings Analytics</CardTitle>
                    <div className="text-sm text-gray-500">
                      {startDate && endDate
                        ? `${format(startDate, "PPP")} - ${format(
                            endDate,
                            "PPP"
                          )}`
                        : "Select a date range"}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ProviderEarningsPieChart data={providerEarnings} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
