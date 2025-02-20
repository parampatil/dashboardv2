// app/admin/users/page.tsx
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { User, Role } from "@/types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertCircle } from "lucide-react";
import { RoleSelector } from "@/components/admin/RoleSelector";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  assignRoleToUser,
  removeRoleFromUser,
  deleteUser,
} from "@/app/actions/users";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUsers: () => void;
    let unsubscribeRoles: () => void;
  
    const setupSubscriptions = async () => {
      try {
        unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
          const usersData = snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          } as User));
          setUsers(usersData);
          setLoading(false);
        });
  
        unsubscribeRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
          const rolesData = snapshot.docs.map((doc) => ({
            name: doc.id,
            ...doc.data(),
          } as Role));
          setRoles(rolesData);
        });
      } catch (error) {
        console.error("Error setting up subscriptions:", error);
        setLoading(false);
      }
    };
  
    setupSubscriptions();
  
    return () => {
      if (unsubscribeUsers) {
        unsubscribeUsers();
      }
      if (unsubscribeRoles) {
        unsubscribeRoles();
      }
    };
  }, []);

  const handleAddRole = async (userId: string, roleName: string) => {
    await assignRoleToUser(userId, roleName);
  };

  const handleRemoveRole = async (userId: string, roleName: string) => {
    await removeRoleFromUser(userId, roleName);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteUser(deleteConfirm);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <motion.div
      className="bg-gray-50 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="bg-white rounded-xl shadow-sm"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">User Management</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {users.length} Users
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allowed Routes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.uid}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {user.name?.[0] ||
                                      user.email[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <RoleSelector
                              availableRoles={roles}
                              selectedRoles={user.roles || []}
                              onAddRole={(role) =>
                                handleAddRole(user.uid, role)
                              }
                              onRemoveRole={(role) =>
                                handleRemoveRole(user.uid, role)
                              }
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(user.allowedRoutes || {}).map(
                                ([route, name]) => (
                                  <span
                                    key={route}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {name}
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirm(user.uid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              {users.find((u) => u.uid === deleteConfirm)?.email && (
                <p className="text-sm text-gray-500">
                  User: {users.find((u) => u.uid === deleteConfirm)?.email}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
