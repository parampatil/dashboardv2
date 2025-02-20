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

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-700">Total Views</h3>
            <p className="text-3xl font-bold text-blue-500">1,234</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-700">
              Active Users
            </h3>
            <p className="text-3xl font-bold text-green-500">567</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold text-gray-700">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-purple-500">$89,234</p>
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default MainDashboard;
