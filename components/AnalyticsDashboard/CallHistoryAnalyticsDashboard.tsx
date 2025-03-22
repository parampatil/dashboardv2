// components/analytics/CallHistoryAnalyticsDashboard.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  // Convert string values to numbers for calculations
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
    return {
      totalUsers: normalizedData.length,
      totalCalls: normalizedData.reduce(
        (sum, user) => sum + user.numberOfCalls,
        0
      ),
      totalCallTime: normalizedData.reduce(
        (sum, user) => sum + user.totalCallTime,
        0
      ),
      totalProviderTime: normalizedData.reduce(
        (sum, user) => sum + user.callTimeAsProvider,
        0
      ),
      totalConsumerTime: normalizedData.reduce(
        (sum, user) => sum + user.callTimeAsConsumer,
        0
      ),
      avgCallsPerUser:
        normalizedData.length > 0
          ? (
              normalizedData.reduce(
                (sum, user) => sum + user.numberOfCalls,
                0
              ) / normalizedData.length
            ).toFixed(2)
          : 0,
      avgCallTimePerUser:
        normalizedData.length > 0
          ? (
              normalizedData.reduce(
                (sum, user) => sum + user.totalCallTime,
                0
              ) / normalizedData.length
            ).toFixed(2)
          : 0,
      avgProviderTimePerUser:
        normalizedData.length > 0
          ? (
              normalizedData.reduce(
                (sum, user) => sum + user.callTimeAsProvider,
                0
              ) / normalizedData.length
            ).toFixed(2)
          : 0,
      avgConsumerTimePerUser:
        normalizedData.length > 0
          ? (
              normalizedData.reduce(
                (sum, user) => sum + user.callTimeAsConsumer,
                0
              ) / normalizedData.length
            ).toFixed(2)
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
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Calls
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
      </div>

      {/* Provider and Consumer Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Provider Call Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {formatTime(summaryData.totalProviderTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg: {formatTime(Number(summaryData.avgProviderTimePerUser))}{" "}
                per user
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consumer Call Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {formatTime(summaryData.totalConsumerTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg: {formatTime(Number(summaryData.avgConsumerTimePerUser))}{" "}
                per user
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

        <TabsContent value="topUsers" className="p-4 border rounded-md  w-full overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Top {topUsersCount} Users by Call Time</h3>
          <div className="h-80">
            {topUsers.length > 0 ? (
              <div className="flex gap-4 h-full">
                {topUsers.map((user) => {
                  const maxTime = Math.max(...topUsers.map(u => Number(u.totalCallTime)));
                  const heightPercentage = maxTime > 0 ? (Number(user.totalCallTime) / maxTime) * 100 : 0;
                  
                  return (
                    <div key={user.userId} className="flex flex-col items-center flex-1">
                      <div className="flex-1 w-full flex items-end">
                        <div 
                          className="mx-auto w-20 bg-blue-500 rounded-t-md transition-all duration-500"
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium truncate w-30">{user.userName}</p>
                        <p className="text-xs text-gray-500 w-30">{formatTime(Number(user.totalCallTime))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
