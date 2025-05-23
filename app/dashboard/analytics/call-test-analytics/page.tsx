// app/dashboard/analytics/call-test-analytics/page.tsx
"use client";
import { useEffect, useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useApi } from "@/hooks/useApi";

interface CallTestAnalyticsUser {
  userId: string;
  userName: string;
  callTimeConsumer: number;
  callTimeProvider: number;
}

export default function CallTestAnalyticsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [analytics, setAnalytics] = useState<CallTestAnalyticsUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const fetchAnalytics = async () => {
    if (!date) return;
    try {
      setLoading(true);
      const response = await api.fetch("/api/grpc/analytics/call-test-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data.testAnalytics);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load analytics",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/analytics/call-test-analytics"]}>
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <span>Call Test Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "MMM dd, yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={fetchAnalytics} disabled={loading || !date}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead className="text-right">Consumer Time</TableHead>
                <TableHead className="text-right">Provider Time</TableHead>
                <TableHead className="text-right">Total Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell className="text-right">
                    {formatTime(user.callTimeConsumer)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTime(user.callTimeProvider)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatTime(user.callTimeConsumer + user.callTimeProvider)}
                  </TableCell>
                </TableRow>
              ))}
              {analytics.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}
