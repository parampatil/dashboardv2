// app/dashboard/page.tsx
"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const MainDashboard = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Hi {user ? user.displayName || user.email : "Guest"}, welcome back!
          </h1>
          <p className="text-gray-600">
            Welcome to your dashboard! This is the main landing page where you
            can view your overview and quick actions.
          </p>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default MainDashboard;
