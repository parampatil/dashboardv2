// app/admin/invite/UpdateInvitationDialog.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateInvitation } from "@/app/actions/invitations";
import { useToast } from "@/hooks/use-toast";
import { Invitation } from "@/types/invitation";
import { format } from "date-fns";

export function UpdateInvitationDialog({
  invitation,
  open,
  onClose,
  onUpdated,
}: {
  invitation: Invitation;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [expiry, setExpiry] = useState<string>(
    invitation.expiry ? format(invitation.expiry, "yyyy-MM-dd") : ""
  );
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const newExpiry = expiry ? new Date(expiry) : undefined;
      await updateInvitation(invitation.id, {
        expiry: newExpiry,
        historyEntry: {
          timestamp: new Date(),
          action: `Expiry updated to ${newExpiry ? newExpiry.toLocaleDateString() : "none"}`,
          performedBy: "admin",
        },
      });
      
      toast({
        title: "Invitation Updated",
        description: "Expiry date has been updated successfully.",
      });
      onUpdated();
      onClose();
    } catch  {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update invitation.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Invitation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <Input value={invitation.email} disabled />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Expiry Date</label>
            <Input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
          
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
