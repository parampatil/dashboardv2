// app/dashboard/users/page.tsx
"use client";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { List, Search, ChevronRight, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const UsersDashboard = () => {
  const { user } = useAuth();
  
  const userRoutes = [
    {
      path: "/dashboard/users/all-users",
      name: "All Users",
      description: "View and manage all users in the system",
      icon: <List className="h-5 w-5" />,
      color: 'bg-indigo-500'
    },
    {
      path: "/dashboard/users/find-user",
      name: "Find User",
      description: "Search for specific users by their details",
      icon: <Search className="h-5 w-5" />,
      color: 'bg-amber-500'
    },
  ];

  // Filter routes based on user permissions
  const allowedUserRoutes = userRoutes.filter(route => 
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
    <ProtectedRoute allowedRoutes={["/dashboard/users"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Users Dashboard</h1>
          
          <p className="text-gray-600 mb-8">
            Manage user-related activities such as viewing all users or searching for specific ones. Access user information and perform administrative tasks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allowedUserRoutes.map((route) => (
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
          
          {allowedUserRoutes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-lg"
            >
              <UserRound className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">You don&apos;t have access to any user management features.</p>
              <p className="text-gray-400 text-sm mt-2">Contact your administrator for access.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default UsersDashboard;
