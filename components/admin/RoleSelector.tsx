// components/admin/RoleSelector.tsx
"use client";
import { useState } from "react";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

interface RoleSelectorProps {
  availableRoles: Role[];
  selectedRoles: string[];
  onAddRole: (role: string) => void;
  onRemoveRole: (role: string) => void;
}

export const RoleSelector = ({
  availableRoles,
  selectedRoles,
  onAddRole,
  onRemoveRole,
}: RoleSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {selectedRoles.map((role) => (
            <motion.span
              key={role}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {role}
              <button
                onClick={() => onRemoveRole(role)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          >
            <div className="py-1">
              {availableRoles
                .filter((role) => !selectedRoles.includes(role.name))
                .map((role) => (
                  <button
                    key={role.name}
                    onClick={() => {
                      onAddRole(role.name);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {role.name}
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
