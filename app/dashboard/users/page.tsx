// app/dashboard/users/page.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, List, Search } from "lucide-react";

const Users = () => {
  const userRoutes = [
    {
      path: "/dashboard/users/all-users",
      name: "All Users",
      description: "View and manage all users in the system",
      icon: <List className="h-5 w-5" />,
    },
    {
      path: "/dashboard/users/find-user",
      name: "Find User",
      description: "Search for specific users by their details",
      icon: <Search className="h-5 w-5" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
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
          <h2 className="text-lg font-semibold text-gray-800">Users Dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">
            Manage user-related activities such as viewing all users or searching for specific ones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRoutes.map((route) => (
              <motion.div
                key={route.path}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="p-4 flex items-center gap-2 text-gray-700 bg-yellow-400">
                  {route.icon}
                  <h3 className="text-lg font-semibold">{route.name}</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{route.description}</p>
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
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default Users;
