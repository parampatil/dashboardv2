// components/dashboard/DashboardSidebar.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { DashboardFileTree } from "./DashboardFileTree";

const sidebarVariants = {
  expanded: { width: "18rem" },
  collapsed: { width: "4rem" }
};

export function DashboardSidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      className="relative bg-white shadow-lg min-h-screen"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white rounded-full p-1 shadow-md z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="p-4">
        {/* User Info */}
        <motion.div 
          className="mb-8 flex items-center gap-3"
        >
          <Link href="/dashboard" className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-blue-600" />
          </Link>
          {!isCollapsed && (
            <Link href="/dashboard">
              <h2 className="font-semibold truncate">
                {user?.name || user?.email || "Guest"}
              </h2>
              <p className="text-xs text-gray-500">Dashboard</p>
            </Link>
          )}
        </motion.div>

        {/* File Tree Navigation */}
        <DashboardFileTree 
          isCollapsed={isCollapsed} 
          allowedRoutes={user?.allowedRoutes || {}} 
        />
      </div>
    </motion.div>
  );
}
