// app/components/AnalyticsDashboard/charts/TopUsersBarChart.tsx
"use client";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dynamically import Chart.js components to prevent SSR issues
const Bar = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);

interface NormalizedUserCallTime {
  userId: string | number;
  userName: string;
  numberOfCalls: number;
  totalCallTime: number;
  callTimeAsProvider: number;
  callTimeAsConsumer: number;
}

interface TopUsersBarChartProps {
  topUsers: NormalizedUserCallTime[];
  formatTime: (seconds: number) => string;
}

export default function TopUsersBarChart({ 
  topUsers, 
  formatTime 
}: TopUsersBarChartProps) {
  
  const chartData = useMemo(() => {
    return {
      labels: topUsers.map(user => user.userName),
      datasets: [
        {
          label: 'Total Call Time',
          data: topUsers.map(user => user.totalCallTime),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Call Time as Provider',
          data: topUsers.map(user => user.callTimeAsProvider),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Call Time as Consumer',
          data: topUsers.map(user => user.callTimeAsConsumer),
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, [topUsers]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatTime(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            // Convert seconds to a more readable format for the y-axis
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            
            if (hours > 0) {
              return `${hours}h ${minutes}m`;
            } else {
              return `${minutes}m`;
            }
          }
        }
      }
    }
  };

  if (topUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  return <Bar data={chartData} options={chartOptions} />;
}
