// app/dashboard/mp2/page.tsx
"use client";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, AlertTriangle, ChevronRight } from "lucide-react";

const MP2Dashboard = () => {
  const mp2Routes = [
    {
      path: "/dashboard/mp2/users-in-jail",
      name: "Users in Jail",
      description: "View and manage users currently serving jail time.",
      icon: <Users className="h-5 w-5" />,
      color: "bg-red-500",
    },
    {
      path: "/dashboard/mp2/add-to-jail",
      name: "Add Users to Jail",
      description: "Add users to jail for violations.",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-amber-500",
    },
    {
      path: "/dashboard/mp2/dictionary",
      name: "Crime Dictionary",
      description: "Manage the dictionary of crime words and variants.",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-blue-500",
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
    <ProtectedRoute allowedRoutes={["/dashboard/mp2"]}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            MP2 Dashboard - Misuse, Prevention & Protection
          </h1>
          <p className="text-gray-600 mb-8">
            Manage user violations, jail time, and the crime dictionary from this central dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mp2Routes.map((route) => (
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
                  <Link href={route.path} passHref>
                    <Button variant="outline" className="w-full">
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
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

export default MP2Dashboard;
