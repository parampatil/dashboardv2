// components/ui/PieChart.tsx
"use client";
import React, { useEffect, useRef } from 'react';

interface PieChartProps {
  data: { value: number }[];
  colors: string[];
}

export const PieChart: React.FC<PieChartProps> = ({ data, colors }) => {
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
      drawPieChart();
    };

    const drawPieChart = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate total value
      const total = data.reduce((sum, item) => sum + item.value, 0);
      if (total === 0) return;
      
      // Set up dimensions
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      
      // Animation variables
      let currentAngle = 0;
      const targetAngle = Math.PI * 2;
      const animationDuration = 30; // frames
      const angleStep = targetAngle / animationDuration;
      
      const animate = () => {
        // Clear canvas for animation frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let startAngle = 0;
        
        // Draw each slice with current animation progress
        data.forEach((item, index) => {
          const sliceAngle = (item.value / total) * Math.PI * 2;
          const endAngle = startAngle + sliceAngle * (currentAngle / targetAngle);
          
          // Calculate offset for separated slices (optional)
          const mediumAngle = startAngle + (endAngle - startAngle) / 2;
          const offset = 0; // Set to 0 for no separation, or a small value like 10 for separation
          
          ctx.beginPath();
          ctx.moveTo(
            centerX + Math.cos(mediumAngle) * offset, 
            centerY + Math.sin(mediumAngle) * offset
          );
          ctx.arc(
            centerX + Math.cos(mediumAngle) * offset, 
            centerY + Math.sin(mediumAngle) * offset, 
            radius, 
            startAngle, 
            endAngle
          );
          ctx.lineTo(
            centerX + Math.cos(mediumAngle) * offset, 
            centerY + Math.sin(mediumAngle) * offset
          );
          ctx.closePath();
          
          ctx.fillStyle = colors[index % colors.length];
          ctx.fill();
          
          startAngle = endAngle;
        });
        
        // Continue animation if not complete
        currentAngle += angleStep;
        if (currentAngle < targetAngle) {
          requestAnimationFrame(animate);
        } else {
          // Draw one final time with complete angles to ensure no gaps
          currentAngle = targetAngle;
          let finalStartAngle = 0;
          
          data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * Math.PI * 2;
            const finalEndAngle = finalStartAngle + sliceAngle;
            
            const mediumAngle = finalStartAngle + (finalEndAngle - finalStartAngle) / 2;
            const offset = 0;
            
            ctx.beginPath();
            ctx.moveTo(
              centerX + Math.cos(mediumAngle) * offset, 
              centerY + Math.sin(mediumAngle) * offset
            );
            ctx.arc(
              centerX + Math.cos(mediumAngle) * offset, 
              centerY + Math.sin(mediumAngle) * offset, 
              radius, 
              finalStartAngle, 
              finalEndAngle
            );
            ctx.lineTo(
              centerX + Math.cos(mediumAngle) * offset, 
              centerY + Math.sin(mediumAngle) * offset
            );
            ctx.closePath();
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            finalStartAngle = finalEndAngle;
          });
        }
      };
      
      // Start animation
      animate();
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
  }, [data, colors]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};
