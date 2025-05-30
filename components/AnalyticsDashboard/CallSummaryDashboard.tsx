// components/AnalyticsDashboard/CallSummaryDashboard.tsx
"use client";

import { useState, useMemo } from "react";
import {
  GetCallMetricsResponse,
  GetCallDurationMetricsResponse,
  DailyCallMetric,
  DailyCallDurationMetric,
  ProtoTimestamp
} from "@/types/grpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart as LucideBarChart, LineChart as LucideLineChartIcon, TrendingUp, Clock, Phone, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Bar as BarJS, Line as LineJS } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
  ChartOptions,
  ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartJsTooltip,
  ChartJsLegend
);

interface CallSummaryDashboardProps {
  callMetricsData: GetCallMetricsResponse | null;
  callDurationData: GetCallDurationMetricsResponse | null;
}

// Helper to format ProtoTimestamp to a readable date string
const formatDateFromProto = (timestamp?: ProtoTimestamp): string => {
  if (!timestamp || !timestamp.seconds) return "N/A";
  try {
    const date = new Date(Number(timestamp.seconds) * 1000);
    return format(date, "MMM dd, yy"); // Shortened year
  } catch (e) {
    console.error("Error formatting date:", e, "Timestamp:", timestamp);
    return "Invalid Date";
  }
};

// Helper to format duration from seconds to a readable string (e.g., Xh Ym Zs)
const formatDuration = (seconds: number = 0): string => {
  if (isNaN(seconds) || seconds < 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  let result = "";
  if (h > 0) result += `${h}h `;
  if (m > 0) result += `${m}m `;
  if (s > 0 || (h === 0 && m === 0)) result += `${s}s`;
  return result.trim() || "0s";
};

export default function CallSummaryDashboard({
  callMetricsData,
  callDurationData,
}: CallSummaryDashboardProps) {
  const [showCumulative, setShowCumulative] = useState(false);

  // Memoized chart data for Call Metrics
  const callMetricsChartJsData = useMemo((): ChartData<'bar'> => {
    if (!callMetricsData) return { labels: [], datasets: [] };

    if (showCumulative) {
      const totals = callMetricsData.totals;
      return {
        labels: ['Total Calls', 'Successful Calls', 'Failed Calls'],
        datasets: [
          {
            label: 'Period Totals',
            data: [totals?.totalCalls || 0, totals?.successfulCalls || 0, totals?.failedCalls || 0],
            backgroundColor: ['#3b82f6', '#22c55e', '#ef4444'],
            borderRadius: 4,
          },
        ],
      };
    } else {
      const dailySorted = callMetricsData.dailyBreakdown?.slice().sort((a, b) => Number(a.date.seconds) - Number(b.date.seconds)) || [];
      return {
        labels: dailySorted.map(item => formatDateFromProto(item.date)),
        datasets: [
          {
            label: 'Total Calls',
            data: dailySorted.map(item => item.totalCalls || 0),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
          },
          {
            label: 'Successful Calls',
            data: dailySorted.map(item => item.successfulCalls || 0),
            backgroundColor: '#22c55e',
            borderRadius: 4,
          },
          {
            label: 'Failed Calls',
            data: dailySorted.map(item => item.failedCalls || 0),
            backgroundColor: '#ef4444',
            borderRadius: 4,
          },
        ],
      };
    }
  }, [callMetricsData, showCumulative]);

  // Memoized chart data for Call Duration
  const callDurationChartJsData = useMemo((): ChartData<'line' | 'bar'> => {
    if (!callDurationData) return { labels: [], datasets: [] };

    if (showCumulative) {
      const totals = callDurationData.totals;
      return {
        labels: ['Avg. Duration (Period)', 'Total Call Time (Period)'],
        datasets: [
          {
            label: 'Duration Metrics',
            data: [
              parseFloat(((totals?.averageDurationAcrossPeriod || 0) / 60).toFixed(2)), // Avg in minutes
              parseFloat(((totals?.totalCallTimeForDateRange || 0) / 3600).toFixed(2)) // Total in hours
            ],
            backgroundColor: ['#8884d8', '#82ca9d'],
            borderRadius: 4,
          },
        ],
      };
    } else {
      const dailySorted = callDurationData.dailyBreakdown?.slice().sort((a, b) => Number(a.date.seconds) - Number(b.date.seconds)) || [];
      return {
        labels: dailySorted.map(item => formatDateFromProto(item.date)),
        datasets: [
          {
            label: 'Avg Duration (min)',
            data: dailySorted.map(item => parseFloat(((item.averageCallDuration || 0) / 60).toFixed(2))),
            borderColor: '#8884d8',
            backgroundColor: 'rgba(136, 132, 216, 0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'yLeft',
          },
          {
            label: 'Total Duration (hr)',
            data: dailySorted.map(item => parseFloat(((item.totalCallTime || 0) / 3600).toFixed(2))),
            borderColor: '#82ca9d',
            backgroundColor: 'rgba(130, 202, 157, 0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'yRight',
          },
        ],
      };
    }
  }, [callDurationData, showCumulative]);

  // Common Chart.js options
  const commonChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12 },
          color: '#4b5563', // text-gray-600
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, color: '#6b7280' }, // text-gray-500
        grid: { display: false }
      },
      // Y-axis defined per chart type if needed
    }
  };

  const barChartOptions: ChartOptions<'bar'> = {
    ...commonChartOptions,
    scales: {
      ...commonChartOptions.scales,
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 }, color: '#6b7280' },
        grid: { color: '#e5e7eb' } // border-gray-200
      }
    }
  };

 const lineChartOptions: ChartOptions<'line'> = {
    ...commonChartOptions,
    scales: {
      ...commonChartOptions.scales,
      yLeft: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: { display: true, text: 'Avg Duration (min)', font: {size: 10}, color: '#8884d8' },
        ticks: { font: {size: 10}, color: '#8884d8'},
        grid: { color: '#e5e7eb' }
      },
      yRight: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: { display: true, text: 'Total Duration (hr)', font: {size: 10}, color: '#82ca9d' },
        ticks: { font: {size: 10}, color: '#82ca9d'},
        grid: { display: false } // Avoid overlapping grids
      }
    },
    plugins: {
        ...commonChartOptions.plugins,
        tooltip: {
            ...commonChartOptions.plugins?.tooltip,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y;
                        if (context.dataset.label === 'Avg Duration (min)') label += ' min';
                        if (context.dataset.label === 'Total Duration (hr)') label += ' hr';
                    }
                    return label;
                }
            }
        }
    }
  };

  const cumulativeDurationBarChartOptions: ChartOptions<'bar'> = {
    ...commonChartOptions,
    scales: {
        ...commonChartOptions.scales,
         y: {
            beginAtZero: true,
            ticks: { font: {size: 10}, color: '#6b7280'},
            grid: { color: '#e5e7eb' }
        }
    },
    plugins: {
        ...commonChartOptions.plugins,
        tooltip: {
            ...commonChartOptions.plugins?.tooltip,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y;
                        if (context.label === 'Avg. Duration (Period)') label += ' min';
                        if (context.label === 'Total Call Time (Period)') label += ' hr';
                    }
                    return label;
                }
            }
        }
    }
  };


  if (!callMetricsData && !callDurationData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <p className="text-xl font-semibold text-muted-foreground">No data available.</p>
        <p className="text-sm text-muted-foreground">Please select a date range and fetch data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4 justify-end">
        <Switch
          id="cumulative-toggle"
          checked={showCumulative}
          onCheckedChange={setShowCumulative}
        />
        <Label htmlFor="cumulative-toggle" className="text-sm font-medium text-gray-700">
          Show Cumulative Data for Charts
        </Label>
      </div>

      {/* Call Metrics Section */}
      {callMetricsData && (
        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
              <Phone className="mr-2 h-5 w-5 text-blue-600" />
              Call Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Total Calls" value={callMetricsData.totals?.totalCalls?.toString() || "0"} icon={<TrendingUp className="text-green-500"/>} />
              <MetricCard title="Successful Calls" value={callMetricsData.totals?.successfulCalls?.toString() || "0"} icon={<CheckCircle2 className="text-green-500"/>} />
              <MetricCard title="Failed Calls" value={callMetricsData.totals?.failedCalls?.toString() || "0"} icon={<XCircle className="text-red-500"/>} />
            </div>

            {(showCumulative || (callMetricsData.dailyBreakdown && callMetricsData.dailyBreakdown.length > 0)) && (
                 <div className="h-[350px] bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h3 className="text-md font-semibold mb-3 text-center text-gray-600">
                        {showCumulative ? "Total Call Counts" : "Daily Call Volume"}
                    </h3>
                    <BarJS data={callMetricsChartJsData as ChartData<'bar'>} options={barChartOptions} />
                </div>
            )}

            {!showCumulative && (
                <DetailsTable title="Daily Call Metrics Breakdown">
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Calls</TableHead>
                    <TableHead className="text-right">Successful</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {callMetricsData.dailyBreakdown && callMetricsData.dailyBreakdown.length > 0 ? (
                    callMetricsData.dailyBreakdown.slice().sort((a,b) => Number(b.date.seconds) - Number(a.date.seconds)).map((item: DailyCallMetric, index: number) => (
                        <TableRow key={`cm-${index}-${item.date?.seconds}`}>
                        <TableCell>{formatDateFromProto(item.date)}</TableCell>
                        <TableCell className="text-right">{item.totalCalls || 0}</TableCell>
                        <TableCell className="text-right">{item.successfulCalls || 0}</TableCell>
                        <TableCell className="text-right">{item.failedCalls || 0}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">No daily call metrics available.</TableCell></TableRow>
                    )}
                </TableBody>
                </DetailsTable>
            )}
          </CardContent>
        </Card>
      )}

      {/* Call Duration Metrics Section */}
      {callDurationData && (
        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
              <Clock className="mr-2 h-5 w-5 text-purple-600" />
              Call Duration Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard title="Avg. Duration (Period)" value={formatDuration(callDurationData.totals?.averageDurationAcrossPeriod)} icon={<LucideLineChartIcon className="text-indigo-500"/>} />
              <MetricCard title="Total Call Time (Period)" value={formatDuration(callDurationData.totals?.totalCallTimeForDateRange)} icon={<LucideBarChart className="text-orange-500"/>} />
            </div>

            {(showCumulative || (callDurationData.dailyBreakdown && callDurationData.dailyBreakdown.length > 0)) && (
                 <div className="h-[350px] bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h3 className="text-md font-semibold mb-3 text-center text-gray-600">
                        {showCumulative ? "Total Duration Metrics" : "Daily Call Duration Trends"}
                    </h3>
                    {showCumulative ? (
                        <BarJS data={callDurationChartJsData as ChartData<'bar'>} options={cumulativeDurationBarChartOptions} />
                    ) : (
                        <LineJS data={callDurationChartJsData as ChartData<'line'>} options={lineChartOptions} />
                    )}
                </div>
            )}
            {!showCumulative && (
                <DetailsTable title="Daily Call Duration Breakdown">
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Avg. Duration</TableHead>
                    <TableHead className="text-right">Total Call Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {callDurationData.dailyBreakdown && callDurationData.dailyBreakdown.length > 0 ? (
                    callDurationData.dailyBreakdown.slice().sort((a,b) => Number(b.date.seconds) - Number(a.date.seconds)).map((item: DailyCallDurationMetric, index: number) => (
                        <TableRow key={`cd-${index}-${item.date?.seconds}`}>
                        <TableCell>{formatDateFromProto(item.date)}</TableCell>
                        <TableCell className="text-right">{formatDuration(item.averageCallDuration)}</TableCell>
                        <TableCell className="text-right">{formatDuration(item.totalCallTime)}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No daily call duration metrics available.</TableCell></TableRow>
                    )}
                </TableBody>
                </DetailsTable>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const MetricCard = ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
  <Card className="hover:shadow-md transition-shadow bg-white border-gray-100">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </CardContent>
  </Card>
);

const DetailsTable = ({ title, children }: { title: string; children: React.ReactNode}) => (
  <div className="mt-6">
    <h3 className="text-md font-semibold mb-3 text-gray-600">{title}</h3>
    <ScrollArea className="h-[300px] rounded-md border border-gray-200 bg-white">
      <Table>{children}</Table>
    </ScrollArea>
  </div>
);

