// app/dashboard/layout.tsx
"use client"; // If DashboardBreadcrumbs or children need client context
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { motion } from "framer-motion";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // The main div and motion.main are now handled by the root layout's AppContent
    // This layout component might just provide dashboard-specific context or structure if needed,
    // or directly render children with breadcrumbs.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DashboardBreadcrumbs />
      {children}
    </motion.div>
  );
};
export default DashboardLayout;