// app/dashboard/layout.tsx
"use client";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { motion } from "framer-motion";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />

      <motion.main
        className="flex-1 p-8 overflow-x-auto overflow-y-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardBreadcrumbs />
        {children}
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
