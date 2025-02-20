// app/dashboard/dashboard2/page.tsx
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

const Dashboard2 = () => {
  return (
    <ProtectedRoute allowedRoutes={["/dashboard/dashboard3"]}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Analytics Chart */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-6 rounded-lg shadow-md lg:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Performance Overview</h2>
              <div className="h-80 bg-gray-100 rounded-lg"></div>
            </motion.div>

            {/* Traffic Sources */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Traffic Sources</h2>
              <div className="h-64 bg-gray-100 rounded-lg"></div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Direct</span>
                  <span className="font-semibold">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Organic Search</span>
                  <span className="font-semibold">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Referral</span>
                  <span className="font-semibold">23%</span>
                </div>
              </div>
            </motion.div>

            {/* User Behavior */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-4">User Behavior</h2>
              <div className="h-64 bg-gray-100 rounded-lg"></div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">2.5m</p>
                  <p className="text-gray-600">Avg. Session</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">67%</p>
                  <p className="text-gray-600">Bounce Rate</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Dashboard2;
