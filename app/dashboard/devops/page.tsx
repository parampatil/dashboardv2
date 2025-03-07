// app/dashboard/devops/page.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Server, ChevronRight } from "lucide-react";

const DevOps = () => {
  const devOpsRoutes = [
    {
      path: "/dashboard/devops/kubernetes",
      name: "Kubernetes Dashboard",
      description: "Manage Kubernetes clusters and workloads.",
      icon: <Server className="h-5 w-5" />,
      color: "bg-purple-500",
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
    <ProtectedRoute allowedRoutes={["/dashboard/devops"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">DevOps Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Manage all DevOps-related activities from this central dashboard. You can monitor Kubernetes clusters and other infrastructure components.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devOpsRoutes.map((route) => (
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
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default DevOps;
