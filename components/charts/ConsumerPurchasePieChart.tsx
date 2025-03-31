// components/charts/ConsumerPurchasePieChart.tsx
"use client";
import { DollarSign } from "lucide-react";
import { ConsumerPurchaseAnalytics } from "@/types/analytics";
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

interface ConsumerPurchasePieChartProps {
  data: ConsumerPurchaseAnalytics | null;
}

export default function ConsumerPurchasePieChart({ data }: ConsumerPurchasePieChartProps) {
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
      labels: ["Total Purchase Amount"],
      datasets: [
        {
          data: [data.totalPurchaseAmount],
          backgroundColor: ["#4CAF50"],
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
        No purchase data available for the selected period.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      Consumer Purchases
      <div className="flex items-center mb-4">
        <DollarSign className="h-5 w-5 mr-2 text-green-500" />
        <div className="text-3xl font-bold">
          ${data.totalPurchaseAmount.toFixed(2)}
        </div>
      </div>
      <div className="flex-1 h-[200px]">
        <Pie 
          data={preparePieData()} 
          options={pieChartOptions} 
        />
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Total consumer purchases during selected period
      </div>
    </div>
  );
}
