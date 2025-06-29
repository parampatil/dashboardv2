// @/app/dashboard/affiliate/page.tsx
"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { Users2, UserPlus, ChevronRight, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

const AffiliateDashboard = () => {
  const { user } = useAuth();
  
  const affiliateRoutes = [
    {
        path: "/dashboard/affiliate/affiliate-requests",
        name: "Affiliate Requests",
        description: "View and manage affiliate requests",
        icon: <Users2 className="h-5 w-5" />,
        color: 'bg-blue-500'
    },
    {
        path: "/dashboard/affiliate/create-affiliate-request",
        name: "Create Affiliate Request",
        description: "Create a new affiliate request",
        icon: <UserPlus className="h-5 w-5" />,
        color: 'bg-green-500'
    },
  ];

    // Filter routes based on user permissions
    const allowedAffiliateRoutes = affiliateRoutes.filter(route => 
        user?.allowedRoutes && user.allowedRoutes[route.path]
    );

   const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/analytics"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
          
          <p className="text-gray-600 mb-8">
            Explore analytics-related features such as reports, user statistics, call history, and advanced dashboards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allowedAffiliateRoutes.map((route) => (
              <motion.div
                key={route.path}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className={`${route.color} p-4 text-white`}>
                  <div className="flex items-center gap-2">
                    {route.icon}
                    <h2 className="text-lg font-semibold">{route.name}</h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{route.description}</p>
                  <Link href={route.path}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    >
                      Access {route.name}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          {allowedAffiliateRoutes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-lg"
            >
                <NotebookPen className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                <p className="text-gray-500">You do not have access to any affiliate features.</p>
                <p className="text-gray-400 text-sm mt-2">Contact your administrator for access.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};


export default AffiliateDashboard;