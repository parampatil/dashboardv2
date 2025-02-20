// app/profile/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoutes={["/profile"]}>
      <motion.div 
        className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Profile content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* User Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{user.name || user.email}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Roles</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.roles?.map((role) => (
                      <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Allowed Routes</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(user.allowedRoutes || {}).map(([route, name]) => (
                      <span key={route} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
