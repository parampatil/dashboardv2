// app/admin/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const adminCards = [
    {
      title: "User Management",
      description: "Manage users and their permissions",
      icon: <Users className="h-6 w-6" />,
      path: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "Role Management",
      description: "Create and configure roles with route permissions",
      icon: <ShieldCheck className="h-6 w-6" />,
      path: "/admin/roles",
      color: "bg-green-500",
    },
  ];

  return (
    <ProtectedRoute allowedRoutes={["/admin/roles", "/admin/users"]}>
      <motion.div
        className="min-h-screen bg-gray-50 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-8"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your application settings and users</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCards.map((card, index) => (
              <motion.div
                key={card.path}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${card.color} text-white p-3 rounded-lg`}>
                      {card.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {card.title}
                      </h2>
                      <p className="text-gray-500">{card.description}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => router.push(card.path)}
                  >
                    Access {card.title}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
