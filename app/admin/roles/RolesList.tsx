// components/admin/roles/RolesList.tsx
"use client";
import { Role } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { RoleCard } from "./RoleCard";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X } from "lucide-react";

interface RolesListProps {
  roles: Role[];
  loading: boolean;
  editingRole: string | null;
  setEditingRole: (role: string | null) => void;
}

export function RolesList({ roles, loading, editingRole, setEditingRole }: RolesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-4">
    <motion.div layout className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Search roles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
      {searchQuery && (
        <X
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-red-400 hover:scale-110 transition-all duration-300"
        onClick={() => setSearchQuery("")}
        />
      )}
    </motion.div>
      
      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.name}
              role={role}
              isEditing={editingRole === role.name}
              onEditClick={() => setEditingRole(role.name)}
              onCancelEdit={() => setEditingRole(null)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
