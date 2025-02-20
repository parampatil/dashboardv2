// app/admin/roles/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Role } from "@/types";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { createRole, updateRole, deleteRole } from "@/app/actions/roles";
import { Trash2, Plus, Save, Edit2, X } from "lucide-react";

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    routes: {},
  });
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [tempRoutes, setTempRoutes] = useState<{ [key: string]: string }>({});

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
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (role: Role) => {
    setEditingRole(role.name);
    setTempRoutes(role.routes);
  };

  const handleSaveEdit = async (roleName: string) => {
    await updateRole(roleName, tempRoutes);
    setEditingRole(null);
  };

  const handleCancelEdit = (role: Role) => {
    setEditingRole(null);
    setTempRoutes(role.routes);
  };

  const handleCreateRole = async () => {
    if (!newRole.name) return;

    const roleData = {
      name: newRole.name,
      description: newRole.description || "",
      routes: newRole.routes || {},
    };

    await createRole(roleData);
    setNewRole({ name: "", description: "", routes: {} });
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6">Create New Role</h2>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Role Name"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Description"
                value={newRole.description}
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROUTES.PROTECTED.map((route) => (
                <motion.div
                  key={route.path}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-medium">{route.name}</p>
                    <p className="text-sm text-gray-500">{route.path}</p>
                  </div>
                  <Switch
                    checked={!!newRole.routes?.[route.path]}
                    onCheckedChange={() => {
                      setNewRole((prev) => ({
                        ...prev,
                        routes: {
                          ...prev.routes,
                          [route.path]: route.name,
                        },
                      }));
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <Button onClick={handleCreateRole} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6">
          <AnimatePresence>
            {roles.map((role) => (
              <motion.div
                key={role.name}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold">{role.name}</h3>
                      <p className="text-gray-500">{role.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {editingRole === role.name ? (
                        <>
                          <Button
                            variant="default"
                            onClick={() => handleSaveEdit(role.name)}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCancelEdit(role)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleEditClick(role)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => deleteRole(role.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ROUTES.PROTECTED.map((route) => (
                      <motion.div
                        key={route.path}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div>
                          <p className="font-medium">{route.name}</p>
                          <p className="text-sm text-gray-500">{route.path}</p>
                        </div>
                        <Switch
                          checked={
                            editingRole === role.name
                              ? !!tempRoutes[route.path]
                              : !!role.routes[route.path]
                          }
                          disabled={editingRole !== role.name}
                          onCheckedChange={() => {
                            if (editingRole === role.name) {
                              const updatedRoutes = { ...tempRoutes };
                              if (updatedRoutes[route.path]) {
                                delete updatedRoutes[route.path];
                              } else {
                                updatedRoutes[route.path] = route.name;
                              }
                              setTempRoutes(updatedRoutes);
                            }
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
