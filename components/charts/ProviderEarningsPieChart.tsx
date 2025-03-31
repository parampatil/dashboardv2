// components/charts/ProviderEarningsPieChart.tsx
"use client";
import { Wallet } from "lucide-react";
import { ProviderAnalytics } from "@/types/analytics";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Dynamically import Chart.js components to prevent SSR issues
const Pie = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Pie),
  { ssr: false }
);

interface ProviderEarningsPieChartProps {
  data: ProviderAnalytics | null;
}

export default function ProviderEarningsPieChart({ data }: ProviderEarningsPieChartProps) {
  // Prepare data for Chart.js pie chart
  const preparePieData = () => {
    if (!data) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e0e0e0"],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: ["Total Earnings", "Total Payouts"],
      datasets: [
        {
          data: [
            data.totalEarning,
            data.totalPayout,
          ],
          backgroundColor: ["#2196F3", "#FFC107"],
          borderWidth: 0,
        },
      ],
    };
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  if (!data) {
    return (
      <div className="text-center text-gray-500 h-full flex items-center justify-center">
        No earnings data available for the selected period.
      </div>
    );
  }

  const totalEarning = data.totalEarning.toFixed(2);
  const totalPayout = data.totalPayout.toFixed(2);
  const netEarnings = (data.totalEarning - data.totalPayout).toFixed(2);

  return (
    <div className="flex flex-col h-full">
      Net Earnings
      <div className="flex items-center mb-4">
        <Wallet className="h-5 w-5 mr-2 text-blue-500" />
        <div className="text-3xl font-bold">
          ${netEarnings}
        </div>
      </div>
      <div className="flex-1 h-[200px]">
        <Pie 
          data={preparePieData()} 
          options={pieChartOptions} 
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#2196F3] mr-2"></div>
          <span>Provider Earnings: ${totalEarning}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#FFC107] mr-2"></div>
          <span>Payouts: ${totalPayout}</span>
        </div>
      </div>
    </div>
  );
}
