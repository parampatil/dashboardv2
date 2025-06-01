// components/UsersDashboard/DeleteUserButton.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Added DialogClose for explicit closing
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { Trash2, Loader2 } from "lucide-react"; // Added Loader2

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await api.fetch("/api/grpc/users/soft-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // Ensure your API expects { userId: string }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Deletion failed");
      }

      toast({
        title: "User Deleted",
        description: "The user was soft-deleted successfully.",
      });
      setIsOpen(false); // Close dialog on success
      // Consider a callback to refresh the user list instead of full reload
      // For now, keeping reload as it might be expected by current parent component
      setTimeout(() => {
        window.location.reload(); 
      }, 1200);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user.";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
      // setIsOpen(false); // Ensure dialog closes even on error if desired
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)} className="h-8 px-2 text-xs"> {/* Adjusted size */}
        <Trash2 className="h-3 w-3 mr-1" /> Delete
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            {/* Added DialogTitle for accessibility */}
            <DialogTitle>Confirm User Deletion</DialogTitle> 
            <DialogDescription>
              This action will soft-delete the user. This means the user will be marked as deleted but can be restored later. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2 pt-4"> {/* Added gap and pt */}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto" disabled={isDeleting}>
                Cancel
                </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
