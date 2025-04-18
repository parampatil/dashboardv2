// app/profile/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Group routes by their path structure (dashboard/groupname/...)
  const groupRoutes = () => {
    if (!user.allowedRoutes) return {};

    const groups: Record<string, { name: string; path: string }[]> = {};

    Object.entries(user.allowedRoutes).forEach(([path, name]) => {
      // Skip non-dashboard routes
      if (!path.startsWith("/dashboard/")) return;

      const parts = path.split("/");
      if (parts.length >= 3) {
        const groupKey = parts[2]; // e.g., 'users', 'location', etc.

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }

        groups[groupKey].push({ path, name: name as string });
      }
    });

    return groups;
  };

  const routeGroups = groupRoutes();

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <ProtectedRoute allowedRoutes={["/profile"]}>
      <motion.div
        className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Profile Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
              <motion.div
                className="flex items-center space-x-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {user.imageUrl ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      width={96}
                      height={96}
                      className="rounded-full border-4 border-white shadow-lg"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600 shadow-lg border-4 border-white"
                  >
                    {user.name?.[0]?.toUpperCase() ||
                      user.email[0].toUpperCase()}
                  </motion.div>
                )}
                <div className="text-white">
                  <motion.h1
                    className="text-3xl font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {user.name || "User"}
                  </motion.h1>
                  <motion.p
                    className="text-blue-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {user.email}
                  </motion.p>
                </div>
              </motion.div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-8">
              {/* Account Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="h-6 w-1 bg-blue-600 rounded-full mr-2"></span>
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-sm text-gray-500">Admin Dashboard User ID</p>
                    <p className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {user.uid}
                    </p>
                  </motion.div>
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {user.email}
                    </p>
                  </motion.div>
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {formatDate(user.createdAt)}
                    </p>
                  </motion.div>
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {formatDate(user.updatedAt)}
                    </p>
                  </motion.div>
                </div>
              </motion.section>

              {/* Roles */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="h-6 w-1 bg-indigo-600 rounded-full mr-2"></span>
                  Assigned Roles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.roles?.length ? (
                    user.roles.map((role) => (
                      <motion.span
                        key={role}
                        className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {role}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-gray-500">No roles assigned</p>
                  )}
                </div>
              </motion.section>
            </div>
          </motion.div>

          {/* Access Permissions */}
          <motion.section
            variants={containerAnimation}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-xl overflow-hidden p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="h-6 w-1 bg-green-600 rounded-full mr-2"></span>
              Access Permissions
            </h2>

            {/* Show non-categorized routes first */}
            {Object.entries(user.allowedRoutes || {}).filter(
              ([path]) =>
                !path.startsWith("/dashboard/") || path.split("/").length < 3
            ).length > 0 && (
              <motion.div variants={itemAnimation} className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">
                  General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(user.allowedRoutes || {})
                    .filter(
                      ([path]) =>
                        !path.startsWith("/dashboard/") ||
                        path.split("/").length < 3
                    )
                    .map(([path, name]) => (
                      <motion.div
                        key={path}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {name as string}
                          </p>
                          <p className="text-xs text-gray-500">{path}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(path)}
                          className="ml-2"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Categorized Routes */}
            {Object.entries(routeGroups).map(([groupName, routes]) => (
              <motion.div
                key={groupName}
                variants={itemAnimation}
                className="mb-6"
              >
                <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2 capitalize">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {routes.map(({ path, name }) => (
                    <motion.div
                      key={path}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">{name}</p>
                        <p className="text-xs text-gray-500">{path}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(path)}
                        className="ml-2 flex-shrink-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {Object.keys(user.allowedRoutes || {}).length === 0 && (
              <motion.p
                variants={itemAnimation}
                className="text-gray-500 text-center py-6"
              >
                No access permissions assigned
              </motion.p>
            )}
          </motion.section>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
