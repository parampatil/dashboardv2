// app/layout.tsx
"use client"; // Root layout needs to be client component for state and effects

import { AuthProvider } from "@/context/AuthContext"; // Assuming useAuth is exported for direct use if needed
import { EnvironmentProvider } from "@/context/EnvironmentContext";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"; // The global sidebar
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

// Metadata can still be defined statically if needed, or dynamically in child page.tsx/layout.tsx files
// export const metadata = {
//   title: "360 World App", // More generic title
//   description: "360 World Application",
// };


// Inner layout component to access auth context for sidebar visibility
function AppContent({ children }: { children: React.ReactNode }) {
  // const { user, loading: authLoading } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);
  const [desktopSidebarActualWidth, setDesktopSidebarActualWidth] = useState("4.5rem"); // Default collapsed

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobileView(mobile);
      if (mobile) {
        setDesktopSidebarActualWidth("0rem");
      }
      // For desktop, initial width is set by NewDashboardSidebar via callback
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDesktopSidebarWidthChange = useCallback((newWidth: string) => {
    if (!isMobileView) {
      setDesktopSidebarActualWidth(newWidth);
    } else {
      setDesktopSidebarActualWidth("0rem"); // Ensure 0 padding on mobile
    }
  }, [isMobileView]);


  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardSidebar onDesktopWidthChange={handleDesktopSidebarWidthChange} />
      
      <motion.main
        className="flex-1 overflow-x-auto"
        style={{
          paddingLeft: isMobileView ? '0px' : desktopSidebarActualWidth,
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Adjust top padding for mobile if a fixed mobile header/trigger is part of NewDashboardSidebar */}
        <div className={cn("p-4 sm:p-6 lg:p-8 w-full", 
            // isMobileView ? "pt-16 sm:pt-20" : "pt-6" // Increased top padding for mobile if sidebar trigger is fixed top-left
        )}>
          {children}
        </div>
      </motion.main>
    </div>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <EnvironmentProvider>
            <AppContent>{children}</AppContent>
          </EnvironmentProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
