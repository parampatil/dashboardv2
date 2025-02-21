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
import {
  Trash2,
  Plus,
  Save,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    routes: {},
  });
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [tempRoutes, setTempRoutes] = useState<{ [key: string]: string }>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const { toast } = useToast();

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
    try {
      await updateRole(roleName, tempRoutes);
      toast({
        title: "Role Updated",
        description: "The role has been updated successfully.",
      });
      setEditingRole(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update the role.",
      });
    }
  };

  const handleCancelEdit = (role: Role) => {
    setEditingRole(null);
    setTempRoutes(role.routes);
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Role name is required.",
      });
      return;
    }

    const roleData = {
      name: newRole.name,
      description: newRole.description || "",
      routes: newRole.routes || {},
    };

    await createRole(roleData);
    setNewRole({ name: "", description: "", routes: {} });
    setShowCreateForm(false);
  };

  return (
    <motion.div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Collapsible Create Role Section */}
        <motion.div className="bg-white rounded-xl shadow-sm mb-8">
          <div
            className="p-4 cursor-pointer flex justify-between items-center"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <h2 className="text-2xl font-bold">Create New Role</h2>
            {showCreateForm ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showCreateForm && (
            <motion.div
              className="p-6 pt-0"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
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
                        onCheckedChange={(checked) => {
                          setNewRole((prev) => {
                            const updatedRoutes = { ...prev.routes };
                            if (checked) {
                              updatedRoutes[route.path] = route.name;
                            } else {
                              delete updatedRoutes[route.path];
                            }
                            return {
                              ...prev,
                              routes: updatedRoutes,
                            };
                          });
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
          )}
        </motion.div>

        {/* Roles List */}
        <div className="grid gap-3">
          <AnimatePresence>
            {roles.map((role) => (
              <motion.div
                key={role.name}
                className="bg-white rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedRole(
                      expandedRole === role.name ? null : role.name
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{role.name}</h3>
                      <p className="text-gray-500">{role.description}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {editingRole === role.name ? (
                        <>
                          <Button
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit(role.name);
                            }}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRole(null);
                              handleCancelEdit(role);
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRole(
                              expandedRole === role.name ? null : role.name
                            );
                            handleEditClick(role);
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRole(role.name);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedRole === role.name ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Routes Section */}
                {expandedRole === role.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ROUTES.PROTECTED.map((route) => (
                          <motion.div
                            key={route.path}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div>
                              <p className="font-medium">{route.name}</p>
                              <p className="text-sm text-gray-500">
                                {route.path}
                              </p>
                            </div>
                            <Switch
                              checked={
                                editingRole === role.name
                                  ? !!tempRoutes[route.path]
                                  : !!role.routes[route.path]
                              }
                              disabled={editingRole !== role.name}
                              onCheckedChange={(checked) => {
                                if (editingRole === role.name) {
                                  const updatedRoutes = { ...tempRoutes };
                                  if (checked) {
                                    updatedRoutes[route.path] = route.name;
                                  } else {
                                    delete updatedRoutes[route.path];
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
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
