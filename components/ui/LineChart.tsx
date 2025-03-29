// components/ui/LineChart.tsx
"use client";
import { useRef, useEffect } from "react";

interface DataPoint {
  label: string;
  values: {
    [key: string]: number;
  };
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  lineColors?: { [key: string]: string };
  backgroundColor?: string;
  gridColor?: string;
  textColor?: string;
  showLegend?: boolean;
  yAxisLabel?: string;
}

export const LineChart = ({
  data,
  width = 800,
  height = 400,
  lineColors = {},
  backgroundColor = "white",
  gridColor = "#e5e5e5",
  textColor = "#333",
  showLegend = true,
  yAxisLabel,
}: LineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions with higher resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Chart dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Get all series names
    const seriesNames = new Set<string>();
    data.forEach((point) => {
      Object.keys(point.values).forEach((key) => seriesNames.add(key));
    });
    const seriesArray = Array.from(seriesNames);

    // Default colors if not provided
    const defaultColors = [
      "#4f46e5", // indigo
      "#10b981", // emerald
      "#ef4444", // red
      "#f59e0b", // amber
      "#8b5cf6", // violet
    ];

    // Assign colors to each series
    seriesArray.forEach((series, index) => {
      if (!lineColors[series]) {
        lineColors[series] = defaultColors[index % defaultColors.length];
      }
    });

    // Find min and max values for y-axis
    let minValue = Infinity;
    let maxValue = -Infinity;
    data.forEach((point) => {
      Object.values(point.values).forEach((value) => {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });

    // Add some padding to the min/max values
    const valueRange = maxValue - minValue;
    minValue = Math.max(0, minValue - valueRange * 0.1);
    maxValue = maxValue + valueRange * 0.1;

    // Draw grid and axes
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Horizontal grid lines
    const yTickCount = 5;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "12px sans-serif";
    ctx.fillStyle = textColor;

    for (let i = 0; i <= yTickCount; i++) {
      const y = padding + chartHeight - (i / yTickCount) * chartHeight;
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      
      const value = minValue + (i / yTickCount) * (maxValue - minValue);
      ctx.fillText(value.toFixed(1), padding - 10, y);
    }

    // Y-axis label if provided
    if (yAxisLabel) {
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    }

    // Vertical grid lines and x-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xStep = chartWidth / (data.length - 1);
    
    data.forEach((point, i) => {
      const x = padding + i * xStep;
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.fillText(point.label, x, padding + chartHeight + 10);
    });
    
    ctx.stroke();

    // Draw data lines
    seriesArray.forEach((series) => {
      ctx.strokeStyle = lineColors[series] || "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((point, i) => {
        const x = padding + i * xStep;
        if (point.values[series] === undefined) return;
        
        const yRatio = (point.values[series] - minValue) / (maxValue - minValue);
        const y = padding + chartHeight - yRatio * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Draw data points
      ctx.fillStyle = lineColors[series] || "#000";
      data.forEach((point, i) => {
        if (point.values[series] === undefined) return;
        
        const x = padding + i * xStep;
        const yRatio = (point.values[series] - minValue) / (maxValue - minValue);
        const y = padding + chartHeight - yRatio * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw legend
    if (showLegend && seriesArray.length > 0) {
      const legendY = 20;
      const legendItemWidth = 150;
      const legendX = (width - (seriesArray.length * legendItemWidth)) / 2;
      
      seriesArray.forEach((series, i) => {
        const x = legendX + i * legendItemWidth;
        
        // Draw color box
        ctx.fillStyle = lineColors[series] || "#000";
        ctx.fillRect(x, legendY, 15, 15);
        
        // Draw series name
        ctx.fillStyle = textColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(series, x + 25, legendY + 7);
      });
    }
  }, [data, width, height, lineColors, backgroundColor, gridColor, textColor, showLegend, yAxisLabel]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
};
