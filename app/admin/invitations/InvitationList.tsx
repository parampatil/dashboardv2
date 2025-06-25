// app/admin/invite/InvitationList.tsx
"use client";
import { useState, useMemo, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateInvitation, deleteInvitation } from "@/app/actions/invitations";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  XCircle,
  // Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Invitation, InvitationStatus } from "@/types/invitation";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import CopyToolTip from "@/components/ui/CopyToolTip";
import { UpdateInvitationDialog } from "./UpdateInvitationDialog";

const STATUS_COLORS: Record<InvitationStatus, string> = {
  invited: "bg-blue-100 text-blue-800",
  joined: "bg-green-100 text-green-800",
  requested: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  deleted: "bg-gray-200 text-gray-600",
};

export default function InvitationList({
  invitations,
}: {
  invitations: Invitation[];
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | InvitationStatus>("all");
  const [sortField, setSortField] = useState<"invitedAt" | "updatedAt">(
    "invitedAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedInvitation, setExpandedInvitation] = useState<string | null>(
    null
  );
  const [updatingInvitation, setUpdatingInvitation] =
    useState<Invitation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const filteredInvitations = useMemo(() => {
    const filtered = invitations.filter((invite) => {
      const matchesSearch = invite.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || invite.status === activeTab;
      return matchesSearch && matchesTab;
    });

    return filtered.sort((a, b) => {
      // Handle different date fields
      const getDateValue = (
        invite: Invitation,
        field: "invitedAt" | "updatedAt"
      ) => {
        const date = invite[field];
        // If it's a Firestore Timestamp, convert to Date
        if (
          date &&
          typeof date === "object" &&
          "toDate" in date &&
          typeof date.toDate === "function"
        ) {
          return date.toDate().getTime();
        }
        // If it's already a Date object
        if (date instanceof Date) {
          return date.getTime();
        }
        return 0;
      };

      const aValue = getDateValue(a, sortField);
      const bValue = getDateValue(b, sortField);

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [invitations, searchQuery, activeTab, sortField, sortDirection]);

  const handleUpdateStatus = async (id: string, status: InvitationStatus) => {
    try {
      const action = status === "invited" ? "approved" : "rejected";

      await updateInvitation(id, {
        status,
        decidedAt: new Date(),
        decisionBy: user?.uid || "admin",
        updatedAt: new Date(),
        historyEntry: {
          timestamp: new Date(),
          action: `${action} by ${user?.email || "admin"}`,
          performedBy: user?.uid || "admin",
        },
      });

      toast({
        title: "Status Updated",
        description: `Invitation status updated to ${status}`,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update invitation";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    }
  };

  const toggleSort = (field: "invitedAt" | "updatedAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (date?: Timestamp | Date) => {
    console.log("Formatting date:", date);
    if (!date) return "N/A";
    // Convert to Date object if it's a Timestamp
    const dateObj = "toDate" in date ? date.toDate() : date;
    return format(dateObj, "MMM dd, yyyy HH:mm");
  };

  const getExpiryDisplay = (expiry?: Timestamp | Date) => {
    if (!expiry) return "N/A";

    // Convert to Date object if it's a Timestamp
    const expiryDate = "toDate" in expiry ? expiry.toDate() : expiry;

    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysRemaining > 0 ? `${daysRemaining} days` : "Expired";
  };

  // const handleOpenUpdate = (invite: Invitation) => {
  //   setUpdatingInvitation(invite);
  // };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await deleteInvitation(deletingId);
      toast({
        title: "Invitation Deleted",
        description: "The invitation has been deleted successfully",
      });
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete invitation";
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: errorMessage,
      });
    }
    setLoading(false);
    setDialogOpen(false);
    setDeletingId(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
            >
              All
            </Button>
            {Object.entries(STATUS_COLORS).map(([status]) => (
              <Button
                key={status}
                variant={activeTab === status ? "default" : "outline"}
                onClick={() => setActiveTab(status as InvitationStatus)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>
                <button
                  className="flex items-center"
                  onClick={() => toggleSort("invitedAt")}
                >
                  Invited At
                  {sortField === "invitedAt" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center"
                  onClick={() => toggleSort("updatedAt")}
                >
                  Updated At
                  {sortField === "updatedAt" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </button>
              </TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Environments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No invitations found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvitations.map((invite) => (
                <Fragment key={invite.id}>
                  <TableRow>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      {invite.invitedAt ? formatDate(invite.invitedAt) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {invite.updatedAt ? formatDate(invite.updatedAt) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {invite.expiry ? (
                        <CopyToolTip
                          triggerContent={getExpiryDisplay(invite.expiry)}
                          content={formatDate(invite.expiry)}
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[invite.status]
                        }`}
                      >
                        {invite.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {invite.roles?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {invite.roles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs text-center">
                          No roles assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invite.environments &&
                      Object.keys(invite.environments).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(invite.environments).map(
                            ([envKey, env]) => (
                              <span
                                key={envKey}
                                className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs"
                              >
                                {env || envKey}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs text-center">
                          No environments assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {invite.status === "requested" && (
                          <Fragment key={invite.id}>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(invite.id, "invited")
                              }
                              className="bg-green-500 text-white"
                            >
                              <BadgeCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleUpdateStatus(invite.id, "rejected")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </Fragment>
                        )}
                        {/* {invite.status === "invited" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(invite.id, "invited")
                            }
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        )} */}
                        {/* {invite.status === "invited" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenUpdate(invite)}
                          >
                            Update
                          </Button>
                        )} */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(invite.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setExpandedInvitation(
                              expandedInvitation === invite.id
                                ? null
                                : invite.id
                            )
                          }
                        >
                          {expandedInvitation === invite.id
                            ? "Hide"
                            : "History"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expandedInvitation === invite.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50">
                        <div className="p-4">
                          <h4 className="font-medium mb-2">
                            Invitation History
                          </h4>
                          <div className="space-y-2">
                            {invite.history?.length > 0 ? (
                              invite.history.map((entry, idx) => (
                                <div key={idx} className="flex items-start">
                                  <div className="bg-gray-200 rounded-full h-2 w-2 mt-2 mr-3"></div>
                                  <div>
                                    <p className="font-medium">
                                      {entry.action}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {format(
                                        "toDate" in entry.timestamp &&
                                          typeof entry.timestamp.toDate ===
                                            "function"
                                          ? entry.timestamp.toDate()
                                          : entry.timestamp,
                                        "MMM dd, yyyy HH:mm"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">
                                No history available
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {updatingInvitation && (
        <UpdateInvitationDialog
          invitation={updatingInvitation}
          open={!!updatingInvitation}
          onClose={() => setUpdatingInvitation(null)}
          onUpdated={() => {
            // Refresh data or update local state
            setUpdatingInvitation(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invitation?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invitation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
