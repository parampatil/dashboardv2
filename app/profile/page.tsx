// app/profile/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

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
        className=" bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center space-x-6">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                )}
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-blue-100">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-8">
              {/* Account Information */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium bg-gray-50 p-2 rounded">{user.uid}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium bg-gray-50 p-2 rounded">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium bg-gray-50 p-2 rounded">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium bg-gray-50 p-2 rounded">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Roles & Permissions */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Roles & Permissions</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Assigned Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {user.roles?.map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Access Permissions</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(user.allowedRoutes || {}).map(([route, name]) => (
                        <div
                          key={route}
                          className="flex items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{name}</p>
                            <p className="text-sm text-gray-500">{route}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Account Status */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Status</h2>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
