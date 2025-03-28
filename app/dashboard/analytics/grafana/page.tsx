"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Grafana = () => {
  const [expandedDashboard, setExpandedDashboard] = useState<string | null>(null);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dashboards = [
    {
      id: "main-dashboard",
      title: "Grafana Analytics Dashboard",
      src: "https://grafana-s1.360world.com/"
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedDashboard(expandedDashboard === id ? null : id);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expandedDashboard) {
        setExpandedDashboard(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expandedDashboard]);

  return (
    <ProtectedRoute allowedRoutes={['/dashboard/analytics/grafana']}>
      <div className="space-y-6">
        {dashboards.map(dashboard => {
          const isExpanded = expandedDashboard === dashboard.id;
          
          return (
            <div
              key={dashboard.id}
              ref={el => { containerRefs.current[dashboard.id] = el; }}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{dashboard.title}</h2>
              
              <AnimatePresence>
                <motion.div 
                  initial={false}
                  animate={{
                    position: isExpanded ? 'fixed' : 'relative',
                    top: isExpanded ? 0 : 'auto',
                    left: isExpanded ? 0 : 'auto',
                    right: isExpanded ? 0 : 'auto',
                    bottom: isExpanded ? 0 : 'auto',
                    width: '100%',
                    height: isExpanded ? '100%' : 'calc(100vh - 16rem)',
                    zIndex: isExpanded ? 50 : 'auto',
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="iframe-container relative overflow-hidden rounded-md border bg-white"
                >
                  <iframe
                    src={dashboard.src}
                    title={dashboard.title}
                    className="w-full h-full"
                    loading="lazy"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleExpand(dashboard.id)}
                    className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm"
                  >
                    {isExpanded ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </ProtectedRoute>
  );
};

export default Grafana;
