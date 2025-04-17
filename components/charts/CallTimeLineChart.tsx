// components/charts/CallTimeLineChart.tsx
"use client";
import { format } from "date-fns";
import { DailyCallStats } from "@/types/analytics";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Dynamically import Chart.js components to prevent SSR issues
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

interface CallTimeLineChartProps {
  callStatsPerDay: DailyCallStats[];
}

export default function CallTimeLineChart({
  callStatsPerDay,
}: CallTimeLineChartProps) {
  // Prepare data for Chart.js line chart
  const prepareLineChartData = () => {
    if (!callStatsPerDay || callStatsPerDay.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort the array by date in ascending order
    const sortedStats = [...callStatsPerDay].sort(
      (a, b) => Number(a.date.seconds) - Number(b.date.seconds)
    );

    const labels = sortedStats.map((stat) => {
      const date = new Date(Number(stat.date.seconds) * 1000);
      return format(date, "MMM dd");
    });

    return {
      labels,
      datasets: [
        {
          label: "Total Call Time (minutes)",
          data: sortedStats.map((stat) =>
            Number((stat.totalCallTime / 60).toFixed(2))
          ),
          borderColor: "#1E90FF",
          backgroundColor: "rgba(30, 144, 255, 0.1)",
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: "Average Call Time (minutes)",
          data: sortedStats.map((stat) =>
            Number((stat.averageCallTime / 60).toFixed(2))
          ),
          borderColor: "#FF6347",
          backgroundColor: "rgba(255, 99, 71, 0.1)",
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Minutes",
        },
      },
    },
  };

  if (callStatsPerDay.length === 0) {
    return (
      <div className="text-center text-gray-500 h-full flex items-center justify-center">
        No data available for the selected period.
      </div>
    );
  }

  return <Line data={prepareLineChartData()} options={lineChartOptions} />;
}
