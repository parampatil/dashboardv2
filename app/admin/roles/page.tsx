// app/admin/roles/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { RolesList } from "./RolesList";
import { CreateRoleForm } from "./CreateRoleForm";
import { motion } from "framer-motion";
import { Role } from "@/types";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "roles"), (snapshot) => {
      const rolesData = snapshot.docs.map(
        (doc) =>
          ({
            name: doc.id,
            ...doc.data(),
          } as Role)
      );
      setRoles(rolesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ProtectedRoute allowedRoutes={["/admin/roles"]}>
    <motion.div 
      className="min-h-screen bg-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className=" mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RolesList 
              roles={roles} 
              loading={loading}
              editingRole={editingRole}
              setEditingRole={setEditingRole}
            />
          </div>
          <div>
            <CreateRoleForm />
          </div>
        </div>
      </div>
    </motion.div>
    </ProtectedRoute>
  );
}
