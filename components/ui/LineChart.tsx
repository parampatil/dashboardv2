// components/ui/LineChart.tsx
"use client";
import React, { useEffect, useRef } from 'react';

interface LineChartProps {
  data: { label: string; values: { [key: string]: number } }[];
  yAxisLabel: string;
  lineColors: { [key: string]: string };
}

export const LineChart: React.FC<LineChartProps> = ({ data, yAxisLabel, lineColors }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas responsive
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      drawLineChart();
    };

    const drawLineChart = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set margins
      const margin = { top: 40, right: 200, bottom: 60, left: 80 };
      const chartWidth = canvas.width - margin.left - margin.right;
      const chartHeight = canvas.height - margin.top - margin.bottom;
      
      // Find min and max values
      const keys = Object.keys(data[0].values);
      let maxValue = 0;
      
      data.forEach(item => {
        keys.forEach(key => {
          maxValue = Math.max(maxValue, item.values[key]);
        });
      });
      
      // Add 10% padding to max value
      maxValue *= 1.1;
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, chartHeight + margin.top);
      ctx.lineTo(chartWidth + margin.left, chartHeight + margin.top);
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw y-axis label
      ctx.save();
      ctx.translate(15, margin.top + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
      
      // Draw x-axis labels
      const xStep = chartWidth / (data.length - 1 || 1);
      data.forEach((item, i) => {
        const x = margin.left + i * xStep;
        const y = chartHeight + margin.top + 20;
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x, y);
      });
      
      // Draw y-axis grid lines and labels
      const yStep = chartHeight / 5;
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + chartHeight - i * yStep;
        const value = (maxValue * i / 5).toFixed(1);
        
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.strokeStyle = '#eee';
        ctx.stroke();
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value, margin.left - 10, y + 5);
      }
      
      // Draw legend
      const legendX = margin.left + chartWidth + 10;
      const legendY = margin.top + 20;
      
      keys.forEach((key, i) => {
        const y = legendY + i * 25;
        
        ctx.fillStyle = lineColors[key];
        ctx.fillRect(legendX, y, 15, 15);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(key, legendX + 25, y + 12);
      });
      
      // Draw lines for each data series with animation
      keys.forEach((key, keyIndex) => {
        // Animation variables
        let progress = 0;
        const animationDuration = 30; // frames
        
        const drawLine = () => {
          if (progress >= animationDuration) return;
          
          // Clear only the chart area, not the axes or legend
          ctx.clearRect(margin.left + 1, margin.top, chartWidth - 1, chartHeight);
          
          // Redraw grid
          for (let i = 0; i <= 5; i++) {
            const y = margin.top + chartHeight - i * yStep;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.strokeStyle = '#eee';
            ctx.stroke();
          }
          
          // Draw all lines up to current progress
          keys.forEach((k, idx) => {
            // Only draw lines that have been started already
            if (idx > keyIndex) return;
            
            ctx.beginPath();
            
            let isFirstPoint = true;
            data.forEach((item, i) => {
              if (i > data.length * (progress / animationDuration) && idx === keyIndex) return;
              
              const x = margin.left + i * xStep;
              const y = margin.top + chartHeight - (item.values[k] / maxValue) * chartHeight;
              
              if (isFirstPoint) {
                ctx.moveTo(x, y);
                isFirstPoint = false;
              } else {
                ctx.lineTo(x, y);
              }
            });
            
            ctx.strokeStyle = lineColors[k];
            ctx.lineWidth = k === "Total Call Time (minutes)" ? 4 : 2; // Make the total call time line thicker
            ctx.stroke();
            
            // Draw points
            data.forEach((item, i) => {
              if (i > data.length * (progress / animationDuration) && idx === keyIndex) return;
              
              const x = margin.left + i * xStep;
              const y = margin.top + chartHeight - (item.values[k] / maxValue) * chartHeight;
              
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = lineColors[k];
              ctx.fill();
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          });
          
          progress++;
          if (progress < animationDuration) {
            requestAnimationFrame(drawLine);
          }
        };
        
        // Stagger the animation of each line
        setTimeout(() => {
          drawLine();
        }, keyIndex * 300);
      });
    };

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    
    // Initial draw
    resizeCanvas();
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [data, yAxisLabel, lineColors]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};
