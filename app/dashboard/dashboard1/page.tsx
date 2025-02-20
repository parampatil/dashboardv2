"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Dashboard1 = () => {
  return (
    <ProtectedRoute allowedRoutes={["/dashboard/dashboard1"]}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard 1</h1>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Cards */}
            <motion.div 
              variants={cardVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h2>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Revenue</h2>
              <p className="text-3xl font-bold text-green-600">$45,678</p>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Active Projects</h2>
              <p className="text-3xl font-bold text-purple-600">23</p>
            </motion.div>

            {/* Chart Cards */}
            <motion.div 
              variants={cardVariants}
              className="bg-white p-6 rounded-lg shadow-md md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Analytics Overview</h2>
              <div className="h-64 bg-gray-100 rounded-lg"></div>
            </motion.div>

            {/* Activity Card */}
            <motion.div 
              variants={cardVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Dashboard1;