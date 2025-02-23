// components/admin/roles/RoleCard.tsx
"use client";
import { Role } from "@/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  X,
  Edit2,
  Trash2,
  List,
  Link as LinkIcon,
  ListTree,
} from "lucide-react";
import { useState } from "react";
import { useRouteCategorization } from "@/hooks/useRouteCategorization";
import { updateRole, deleteRole } from "@/app/actions/roles";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Route {
  path: string;
  name: string;
}

interface Category {
  name: string;
  routes: Route[];
}

interface RoleCardProps {
  role: Role;
  isEditing: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

export function RoleCard({
  role,
  isEditing,
  onEditClick,
  onCancelEdit,
}: RoleCardProps) {
  const [tempRoutes, setTempRoutes] = useState(role.routes);
  const [viewMode, setViewMode] = useState<"both" | "names" | "paths">("both");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { categories } = useRouteCategorization();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateRole(role.name, tempRoutes);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      onCancelEdit();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRole(role.name);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete role",
      });
    }
  };

  const toggleViewMode = () => {
    const modes: ("both" | "names" | "paths")[] = ["both", "names", "paths"];
    const currentIndex = modes.indexOf(viewMode);
    setViewMode(modes[(currentIndex + 1) % modes.length]);
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case "both":
        return <ListTree className="h-4 w-4" />;
      case "names":
        return <List className="h-4 w-4" />;
      case "paths":
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const renderRoutes = (category: Category) => {
    const routesToShow = category.routes.filter(
      (route) => isEditing || role.routes[route.path]
    );

    if (!isEditing && routesToShow.length === 0) return null;

    return (
      <motion.div
        key={category.name}
        layout="position"
        transition={{ duration: 0.3 }}
        className="border rounded-lg p-4"
      >
        <h4 className="text-lg font-medium mb-4">{category.name}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(isEditing ? category.routes : routesToShow).map((route) => (
            <motion.div
              key={route.path}
              layout="position"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                {viewMode !== "paths" && (
                  <p className="font-medium">{route.name}</p>
                )}
                {viewMode !== "names" && (
                  <p className="text-sm text-gray-500">{route.path}</p>
                )}
              </div>
              <Switch
                checked={
                  isEditing
                    ? !!tempRoutes[route.path]
                    : !!role.routes[route.path]
                }
                disabled={!isEditing}
                onCheckedChange={(checked) => {
                  if (isEditing) {
                    setTempRoutes((prev) => {
                      const updated = { ...prev };
                      if (checked) {
                        updated[route.path] = route.name;
                      } else {
                        delete updated[route.path];
                      }
                      return updated;
                    });
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <motion.div
        layout="preserve-aspect"
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h3 className="text-xl font-semibold text-blue-600">{role.name}</h3>
          <p className="text-gray-500">{role.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleViewMode}
            title="Toggle view mode"
          >
            {getViewModeIcon()}
          </Button>
          {isEditing ? (
            <>
              <Button variant="default" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={onCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onEditClick}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Role</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the role &quot;{role.name}
                      &quot;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </motion.div>

      <div className="space-y-6">
        {categories.map((category) => renderRoutes(category))}
      </div>
    </motion.div>
  );
}
