// app/dashboard/analytics/call-test-analytics/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar as ShadCalendar } from "@/components/ui/calendar"; // Renamed to avoid conflict
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, RefreshCw, PhoneCall } from "lucide-react"; // Added PhoneCall
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useApi } from "@/hooks/useApi";
import { GetCallTestAnalyticsResponse, callTestAnalyticsUser } from "@/types/grpc";
import { formatDuration, formatDate } from "@/lib/utils"; // Using standardized utils
import { motion } from "framer-motion";
import { useEnvironment } from "@/context/EnvironmentContext";

export default function CallTestAnalyticsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [analytics, setAnalytics] = useState<callTestAnalyticsUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const api = useApi();
    const {currentEnvironment} = useEnvironment();

  const fetchAnalytics = useCallback(async (selectedDate?: Date) => {
    const targetDate = selectedDate || date;
    if (!targetDate) {
        toast({
            variant: "destructive",
            title: "Date required",
            description: "Please select a date to fetch analytics.",
        });
        return;
    }
    try {
      setLoading(true);
      const response = await api.fetch("/api/grpc/analytics/call-test-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate.toISOString() }), // Send ISO string
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch analytics");
      }
      const data: GetCallTestAnalyticsResponse = await response.json();
      setAnalytics(data.testAnalytics || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load analytics",
      });
      setAnalytics([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [api, date, toast]);

  useEffect(() => {
    fetchAnalytics(new Date());
  }, [currentEnvironment]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
        fetchAnalytics(newDate);
    } else {
        setAnalytics([]);
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/analytics/call-test-analytics"]}>
    <motion.div
        className="p-4 md:p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span>Call Test Analytics Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="flex-grow">
                <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    id="date-picker"
                    variant="outline"
                    className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        formatDate(date, "PPP")
                    ) : (
                        <span>Pick a date</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <ShadCalendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(d) => d > new Date() || d < new Date("2000-01-01")}
                    />
                </PopoverContent>
                </Popover>
            </div>
            <Button onClick={() => fetchAnalytics(date)} disabled={loading || !date} className="w-full md:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {loading ? "Fetching..." : "Refresh Report"}
            </Button>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">User Name</TableHead>
                    <TableHead className="text-right">
                        <div className="flex items-center justify-end">
                            <PhoneCall className="h-4 w-4 mr-1 text-blue-500" /> Calls (Consumer)
                        </div>
                    </TableHead>
                    <TableHead className="text-right">Consumer Time</TableHead>
                     <TableHead className="text-right">
                        <div className="flex items-center justify-end">
                            <PhoneCall className="h-4 w-4 mr-1 text-green-500" /> Calls (Provider)
                        </div>
                    </TableHead>
                    <TableHead className="text-right">Provider Time</TableHead>
                    <TableHead className="text-right font-semibold">Total Time</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {analytics.map((user) => (
                    <TableRow key={user.userId} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.userName}</TableCell>
                    <TableCell className="text-right">{user.numberOfCallsAsConsumer ?? 0}</TableCell>
                    <TableCell className="text-right">
                        {formatDuration(user.callTimeConsumer)}
                    </TableCell>
                    <TableCell className="text-right">{user.numberOfCallsAsProvider ?? 0}</TableCell>
                    <TableCell className="text-right">
                        {formatDuration(user.callTimeProvider)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                        {formatDuration(parseInt(user.callTimeConsumer || "0") + parseInt(user.callTimeProvider || "0"))}
                    </TableCell>
                    </TableRow>
                ))}
                {analytics.length === 0 && !loading && (
                    <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No results for the selected date.
                    </TableCell>
                    </TableRow>
                )}
                {loading && (
                    <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </ProtectedRoute>
  );
}
