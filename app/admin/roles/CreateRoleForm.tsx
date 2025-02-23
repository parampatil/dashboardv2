// components/admin/roles/CreateRoleForm.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouteCategorization } from "@/hooks/useRouteCategorization";
import { RouteSelector } from "./RouteSelector";
import { createRole } from "@/app/actions/roles";
import { useToast } from "@/hooks/use-toast";

export function CreateRoleForm() {
  const [newRole, setNewRole] = useState({ name: "", description: "", routes: {} });
  const { categories } = useRouteCategorization();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Role name is required."
      });
      return;
    }

    try {
      await createRole(newRole);
      toast({
        title: "Role Created",
        description: "The new role has been created successfully."
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating the role."
      });
    }
    setNewRole({ name: "", description: "", routes: {} });
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            placeholder="Role Name"
            value={newRole.name}
            onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Description"
            value={newRole.description}
            onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <RouteSelector
              key={category.name}
              category={category}
              selectedRoutes={newRole.routes}
              onChange={(routes) => setNewRole(prev => ({ ...prev, routes }))}
            />
          ))}
        </div>

        <Button type="submit" className="w-full">
          Create Role
        </Button>
      </form>
    </motion.div>
  );
}
