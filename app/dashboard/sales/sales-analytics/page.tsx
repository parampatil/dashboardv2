// app/dashboard/sales/sales-analytics/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { subDays, format } from "date-fns";
import {
  Search,
  Phone,
  Clock,
  Calculator,
  Loader2,
  BarChart3,
  FilterIcon,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { dateToProtoTimestamp, formatDuration as formatDurationUtil } from "@/lib/utils";
import { DateRange } from "react-day-picker";
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
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29), // Default to last 30 days
    to: new Date(),
  });
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false);

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchAnalyticsData = useCallback(async (currentDateRange?: DateRange) => {
    const targetDateRange = currentDateRange || dateRange;
    if (!targetDateRange?.from || !targetDateRange?.to) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
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
      
      const [callAnalyticsRes, purchaseRes, earningsRes] = await Promise.all([
        api.fetch("/api/grpc/sales/user-call-analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: parseInt(userId), startTimestamp, endTimestamp }),
        }),
        api.fetch("/api/grpc/sales/total-purchase-amount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate: startTimestamp, endDate: endTimestamp }),
        }),
        api.fetch("/api/grpc/sales/provider-analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate: startTimestamp, endDate: endTimestamp }),
        })
      ]);

      const callAnalyticsData = await callAnalyticsRes.json();
      if (!callAnalyticsRes.ok) throw new Error(callAnalyticsData.message || "Failed to fetch user call analytics");
      setAnalytics(callAnalyticsData);

      const purchaseData = await purchaseRes.json();
      if (!purchaseRes.ok) throw new Error(purchaseData.message || "Failed to fetch consumer purchase analytics");
      setConsumerPurchase(purchaseData);

      const earningsData = await earningsRes.json();
      if (!earningsRes.ok) throw new Error(earningsData.message || "Failed to fetch provider earnings");
      setProviderEarnings(earningsData);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch analytics",
        description: (error as Error).message,
      });
      setAnalytics(null);
      setConsumerPurchase(null);
      setProviderEarnings(null);
    } finally {
      setLoading(false);
      setIsFiltersSheetOpen(false); 
    }
  }, [api, dateRange, toast, userId]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
        fetchAnalyticsData(dateRange);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnvironment]); // Initial fetch on environment change

  const handleApplyFiltersFromSheet = () => {
    fetchAnalyticsData(dateRange); 
  };
  
  const handleApplyFiltersDesktop = () => {
    fetchAnalyticsData(dateRange);
  }

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/sales", "/dashboard/sales/sales-analytics"]}>
      <motion.div
        className="space-y-4 bg-white rounded-lg p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Page Header */}
        <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-primary" />
              Sales & Call Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Comprehensive overview of sales performance, call statistics, and earnings.
            </p>
        </div>

        {/* Filter Section - Responsive */}
        <Card className="mb-8 shadow-lg rounded-xl border border-slate-200">
            <CardContent className="p-4 md:p-4">
               {/* Desktop Filters - Updated for inline labels and compact height */}
            <div className="hidden md:flex md:items-center md:gap-6 flex-wrap"> {/* Increased gap for better spacing */}
                <div className="flex items-center gap-2"> {/* Inline group for Date Range */}
                    <DateRangePicker
                        dateRange={dateRange}
                        onDateChange={setDateRange}
                        className="h-12" // Adjusted height to h-10 for consistency
                    />
                </div>
                <div className="flex items-center gap-2"> {/* Inline group for User ID */}
                    <Label htmlFor="userIdInputDesktop" className="text-sm font-medium text-slate-700 whitespace-nowrap">User ID:</Label>
                    <Input
                        id="userIdInputDesktop"
                        type="number"
                        placeholder="0 for all"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="h-12 w-36" // Adjusted height and width
                    />
                </div>
                <Button
                    onClick={handleApplyFiltersDesktop}
                    className="h-12 bg-primary hover:bg-primary/90 text-white px-5" // Adjusted height
                    disabled={loading || !dateRange?.from || !dateRange?.to}
                >
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? (<Loader2 className="h-4 w-4 animate-spin" />) : "Apply"}
                </Button>
            </div>

                {/* Mobile Filter Trigger Button */}
                <div className="md:hidden w-full">
                     <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full justify-center text-slate-700 border-slate-300 hover:bg-slate-100 h-12">
                                <FilterIcon className="mr-2 h-5 w-5" />
                                Filters & Date Range
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl p-0">
                            <SheetHeader className="p-6 pb-4 border-b">
                                <SheetTitle className="text-lg">Filters & Date</SheetTitle>
                                <SheetDescription>
                                Select a date range and User ID to refine analytics.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]"> {/* Adjusted max-h */}
                                <div>
                                    <Label htmlFor="date-range-picker-mobile" className="text-sm font-medium text-slate-700 mb-1 block">Date Range</Label>
                                    <DateRangePicker dateRange={dateRange} onDateChange={setDateRange} className="h-12"/>
                                </div>
                                <div>
                                    <Label htmlFor="userIdInputMobile" className="text-sm font-medium text-slate-700 mb-1 block">User ID (Optional)</Label>
                                    <Input
                                        id="userIdInputMobile"
                                        type="number"
                                        placeholder="0 for all users"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                            </div>
                             <SheetFooter className="p-6 border-t flex flex-col sm:flex-row gap-2">
                                <SheetClose asChild>
                                     <Button variant="outline" className="w-full sm:flex-1 h-11">Cancel</Button>
                                </SheetClose>
                                <Button onClick={handleApplyFiltersFromSheet} className="w-full sm:flex-1 bg-primary text-white h-11" disabled={loading || !dateRange?.from || !dateRange?.to}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <Search className="mr-2 h-4 w-4" />}
                                    Apply Filters
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </CardContent>
        </Card>

        {/* Data Display Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
        ) : (
          <div className="space-y-8">
            {/* User Call Analytics */}
            {analytics && (
              <Card className="rounded-xl border shadow-lg">
                <CardHeader className="bg-slate-50 rounded-t-xl">
                  <CardTitle className="text-xl font-semibold text-slate-700 flex items-center">
                    <Phone className="mr-3 h-6 w-6 text-blue-600" /> User Call Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoCard title="Total Calls" value={analytics.totalCalls.toString()} icon={<TrendingUp className="text-green-500"/>} />
                    <InfoCard title="Total Call Time" value={formatDurationUtil(Number(analytics.totalCallTime))} icon={<Clock className="text-sky-500"/>} />
                    <InfoCard title="Average Call Time" value={formatDurationUtil(analytics.averageCallTime)} icon={<Calculator className="text-purple-500"/>} />
                    </div>
                    {analytics.callStatsPerDay && analytics.callStatsPerDay.length > 0 && (
                        <div className="h-[500px] mt-6 bg-white p-4 pb-16 rounded-lg border border-slate-200 shadow-inner">
                            <h4 className="text-md font-semibold text-slate-600 mb-3 text-center">Call Volume & Duration Over Time</h4>
                            <CallTimeLineChart callStatsPerDay={analytics.callStatsPerDay || []} />
                        </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Financial Analytics (Purchases & Earnings) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {consumerPurchase && (
                <Card className="rounded-xl border shadow-lg">
                  <CardHeader className="bg-slate-50 rounded-t-xl">
                    <CardTitle className="text-xl font-semibold text-slate-700 flex items-center">
                      <DollarSign className="mr-3 h-6 w-6 text-emerald-600" /> Consumer Purchases
                    </CardTitle>
                     <CardDescription className="text-sm text-slate-500 pt-1">
                        {dateRange?.from && dateRange?.to
                            ? `Data for ${format(dateRange.from, "MMM d, y")} - ${format(dateRange.to, "MMM d, y")}`
                            : "Select a date range"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 h-[350px] sm:h-[400px]">
                    <ConsumerPurchasePieChart data={consumerPurchase} />
                  </CardContent>
                </Card>
              )}

              {providerEarnings && (
                 <Card className="rounded-xl border shadow-lg">
                  <CardHeader className="bg-slate-50 rounded-t-xl">
                    <CardTitle className="text-xl font-semibold text-slate-700 flex items-center">
                        <TrendingUp className="mr-3 h-6 w-6 text-amber-600" /> Provider Earnings
                    </CardTitle>
                     <CardDescription className="text-sm text-slate-500 pt-1">
                        {dateRange?.from && dateRange?.to
                            ? `Data for ${format(dateRange.from, "MMM d, y")} - ${format(dateRange.to, "MMM d, y")}`
                            : "Select a date range"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 h-[350px] sm:h-[400px]">
                    <ProviderEarningsPieChart data={providerEarnings} />
                  </CardContent>
                </Card>
              )}
            </div>
             {(!analytics && !consumerPurchase && !providerEarnings && !loading) && (
                <div className="text-center py-16 text-slate-500 bg-white rounded-xl shadow-md">
                    <BarChart3 className="mx-auto h-16 w-16 text-slate-400 mb-4"/>
                    <p className="text-xl">No analytics data to display.</p>
                    <p className="text-sm">Please adjust your filters or date range.</p>
                </div>
             )}
          </div>
        )}
      </motion.div>
    </ProtectedRoute>
  );
}

const InfoCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
            {icon}
            <span className="ml-2">{title}</span>
        </div>
        <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
);
