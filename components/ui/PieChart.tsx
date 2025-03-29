import React, { useEffect, useRef, useState } from 'react';

interface PieChartProps {
  data: { label: string; value: number }[];
  colors: string[];
}

export const PieChart: React.FC<PieChartProps> = ({ data, colors }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current.parentElement!);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setAnimationProgress(prev => {
        if (prev < 1) {
          animationFrame = requestAnimationFrame(animate);
          return prev + 0.02;
        }
        return 1;
      });
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0 || size.width === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size.width, size.height);
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    let startAngle = 0;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI * animationProgress;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      startAngle = endAngle;
    });
    
    // Draw legend
    const legendX = size.width - 120;
    const legendY = 20;
    
    data.forEach((item, index) => {
      const y = legendY + index * 25;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(legendX, y, 15, 15);
      
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`${item.label}: $${item.value.toFixed(2)}`, legendX + 25, y + 12);
    });
  }, [data, colors, size, animationProgress]);

  return (
    <div className="w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={size.width} 
        height={size.height}
        className="max-w-full max-h-full"
      />
    </div>
  );
};
