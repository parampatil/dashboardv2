// app/components/AnalyticsDashboard/CallHistoryAnalyticsDashboard.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TopUsersBarChart from "@/components/charts/TopUsersBarChart";

interface UserCallTime {
  userId: string | number;
  userName: string;
  numberOfCalls: string | number;
  totalCallTime: string | number;
  callTimeAsProvider: string | number;
  callTimeAsConsumer: string | number;
}

interface CallHistoryAnalyticsDashboardProps {
  data: UserCallTime[];
  formatTime: (seconds: number) => string;
}

export function CallHistoryAnalyticsDashboard({
  data,
  formatTime,
}: CallHistoryAnalyticsDashboardProps) {
  const [topUsersCount, setTopUsersCount] = useState(5);

  const normalizedData = useMemo(() => {
    return data.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      numberOfCalls: Number(user.numberOfCalls),
      totalCallTime: Number(user.totalCallTime),
      callTimeAsProvider: Number(user.callTimeAsProvider),
      callTimeAsConsumer: Number(user.callTimeAsConsumer),
    }));
  }, [data]);

  const summaryData = useMemo(() => {
    // Calculate actual total calls (half of the sum since each call is counted twice)
    const totalCalls = Math.round(normalizedData.reduce(
      (sum, user) => sum + user.numberOfCalls, 0) / 2);
    
    return {
      totalUsers: normalizedData.length,
      totalCalls: totalCalls,
      // Use only provider time for total call time as it's the same as consumer time
      totalCallTime: normalizedData.reduce(
        (sum, user) => sum + user.callTimeAsProvider, 0),
      // Per user average calls
      avgCallsPerUser: normalizedData.length > 0
        ? (totalCalls / normalizedData.length).toFixed(2)
        : 0,
      // Average call duration per user (total call time / total calls)
      avgCallDurationPerCall: totalCalls > 0
        ? (normalizedData.reduce(
            (sum, user) => sum + user.callTimeAsProvider, 0) / totalCalls).toFixed(2)
        : 0,
      // Average call time per user
      avgCallTimePerUser: normalizedData.length > 0
        ? (normalizedData.reduce(
            (sum, user) => sum + user.callTimeAsProvider, 0) / normalizedData.length).toFixed(2)
        : 0,
    };
  }, [normalizedData]);

  const topUsers = useMemo(() => {
    return [...normalizedData]
      .sort((a, b) => b.totalCallTime - a.totalCallTime)
      .slice(0, topUsersCount);
  }, [normalizedData, topUsersCount]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Number of Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Call Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(summaryData.totalCallTime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Calls Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.avgCallsPerUser}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Call Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(Number(summaryData.avgCallDurationPerCall))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Call Time Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(Number(summaryData.avgCallTimePerUser))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Chart */}
      <Tabs defaultValue="topUsers">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="topUsers">
              <BarChart className="h-4 w-4 mr-2" />
              Top Users
            </TabsTrigger>
          </TabsList>
          <Select
            value={topUsersCount.toString()}
            onValueChange={(value) => setTopUsersCount(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select top users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5 Users</SelectItem>
              <SelectItem value="10">Top 10 Users</SelectItem>
              <SelectItem value="20">Top 20 Users</SelectItem>
              <SelectItem value="50">Top 50 Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="topUsers" className="p-4 border rounded-md w-full overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Top {topUsersCount} Users by Call Time</h3>
          <div className="h-80">
            <TopUsersBarChart 
              topUsers={topUsers} 
              formatTime={formatTime} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
