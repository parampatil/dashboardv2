// app/dashboard/analytics/call-summary/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, LineChart, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import CallSummaryDashboard from "@/components/AnalyticsDashboard/CallSummaryDashboard";
import { GetCallMetricsResponse, GetCallDurationMetricsResponse } from "@/types/grpc";

interface CallSummaryData {
  callMetrics: GetCallMetricsResponse | null;
  callDurationMetrics: GetCallDurationMetricsResponse | null;
}

export default function CallSummaryPage() {
  const [data, setData] = useState<CallSummaryData>({ callMetrics: null, callDurationMetrics: null });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 29), // Default to last 30 days
    to: new Date(),
  });

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment(); // Assuming you have this context

  const fetchData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        variant: "destructive",
        title: "Date range required",
        description: "Please select both start and end dates.",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/analytics/call-metrics-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch call summary data");
      }
      setData({
        callMetrics: result.callMetrics,
        callDurationMetrics: result.callDurationMetrics,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: errorMessage,
      });
      setData({ callMetrics: null, callDurationMetrics: null }); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentEnvironment]); // Refetch when environment changes or fetchData changes

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/analytics", "/dashboard/analytics/call-summary"]}> {/* Adjust allowedRoutes as needed */}
      <motion.div
        className="space-y-6 p-4 md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <LineChart className="mr-2 h-6 w-6 text-primary" />
              Call Metrics & Duration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[280px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      } else if (range?.from) {
                        // If only 'from' is selected, keep 'to' as is or set to 'from'
                        setDateRange({ from: range.from, to: range.from });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={fetchData} disabled={loading || !dateRange.from || !dateRange.to}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Fetch Data"
                )}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading analytics data...</p>
              </div>
            ) : (
              <CallSummaryDashboard
                callMetricsData={data.callMetrics}
                callDurationData={data.callDurationMetrics}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </ProtectedRoute>
  );
}
