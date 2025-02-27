// app/dashboard/rewards/page.tsx
"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { Award, Gift, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const RewardsDashboard = () => {
  const { user } = useAuth();
  
  const rewardRoutes = [
    { 
      path: '/dashboard/rewards/available-rewards', 
      name: 'Available Rewards',
      description: 'View and manage all available rewards in the system',
      icon: <Award className="h-5 w-5" />,
      color: 'bg-amber-500'
    },
    { 
      path: '/dashboard/rewards/give-rewards', 
      name: 'Give Rewards',
      description: 'Assign rewards to users based on their activities',
      icon: <Gift className="h-5 w-5" />,
      color: 'bg-green-500'
    }
  ];

  // Filter routes based on user permissions
  const allowedRewardRoutes = rewardRoutes.filter(route => 
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
    <ProtectedRoute allowedRoutes={["/dashboard/rewards"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Rewards Dashboard</h1>
          
          <p className="text-gray-600 mb-8">
            Manage all reward-related activities from this central dashboard. You can view available rewards and distribute rewards to users.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allowedRewardRoutes.map((route) => (
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
          
          {allowedRewardRoutes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-lg"
            >
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">You don&apos;t have access to any rewards features.</p>
              <p className="text-gray-400 text-sm mt-2">Contact your administrator for access.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default RewardsDashboard;
