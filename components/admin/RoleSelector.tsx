// components/admin/RoleSelector.tsx
"use client";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        {selectedRoles.map((role) => (
          <span
            key={role}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {role}
            <button
              onClick={() => onRemoveRole(role)}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableRoles
              .filter((role) => !selectedRoles.includes(role.name))
              .map((role) => (
                <DropdownMenuItem
                  key={role.name}
                  onClick={() => onAddRole(role.name)}
                >
                  {role.name}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
