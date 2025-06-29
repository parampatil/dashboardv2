// app/dashboard/affiliate/affiliate-requests/CreateRequestDialog.tsx
"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserIdNameMapping } from "@/types/grpc";
import UserSelectionDialog from "./UserSelectionDialog";
import { DialogDescription } from "@radix-ui/react-dialog";

interface CreateRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (userId: string) => void;
  userMapping: UserIdNameMapping;
}

export default function CreateRequestDialog({
  open,
  onClose,
  onCreate,
  userMapping,
}: CreateRequestDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const handleSubmit = () => {
    if (selectedUserId !== null) {
      onCreate(selectedUserId);
      onClose();
      setSelectedUserId(null);
    }
  };

  const selectedUserName = selectedUserId
    ? userMapping[selectedUserId] || selectedUserId
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Affiliate Request</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-500 mb-4">
            Select a user to create an affiliate request for.
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Selected User</Label>
              <div className="flex items-center gap-2">
                <div className="border rounded-md px-4 py-2 flex-1 min-h-[40px] flex items-center">
                  {selectedUserName ? (
                    <div>
                      <div className="font-medium">{selectedUserName}</div>
                      <div className="text-xs text-gray-500">
                        ID: {selectedUserId}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      No user selected
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUserDialogOpen(true)}
                >
                  Select User
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={selectedUserId === null}>
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserSelectionDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        onSelect={setSelectedUserId}
        userMapping={userMapping}
      />
    </>
  );
}
