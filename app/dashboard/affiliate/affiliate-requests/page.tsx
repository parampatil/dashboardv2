// app/dashboard/affiliate/affiliate-requests/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import CreateRequestDialog from "./CreateRequestDialog";
import ActionButtons from "./ActionButtons";
import { Skeleton } from "@/components/ui/skeleton";
import { AffiliateRequest, UserIdNameMapping } from "@/types/grpc";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { formatProtoTimestamp } from "@/lib/utils";
import { useEnvironment } from "@/context/EnvironmentContext";
import CopyTooltip from "@/components/ui/CopyToolTip";
import { toast } from "@/hooks/use-toast";
import { AffiliateRequestStatus } from "@/types/grpc";

type AffiliateRequestItem = AffiliateRequest & { user_name?: string };

export default function AffiliateRequestsPage() {
  const [requests, setRequests] = useState<AffiliateRequestItem[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    AffiliateRequestItem[]
  >([]);
  const [userMapping, setUserMapping] = useState<UserIdNameMapping>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] =
    useState<keyof AffiliateRequestItem>("requested_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const api = useApi();
  const { currentEnvironment } = useEnvironment();
  const { user } = useAuth();

  // User fetching function
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.fetch("/api/grpc/profile/search-users");
      const data = await response.json();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }
      return data.userIdsAndNames || {};
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load user data",
      });
      return {};
    }
  }, [currentEnvironment]);

  // Request fetching function
  const fetchRequests = useCallback(
    async (userMapping: UserIdNameMapping) => {
      setLoading(true);
      try {
        const response = await api.fetch(
          "/api/grpc/affiliate/all-affiliate-requests"
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch requests");
        }
        const data = await response.json();

        const requestsWithUserNames = data.map((request: AffiliateRequest) => ({
          ...request,
          user_name:
            userMapping[request.requestor_user_id] ||
            `Unknown User (${request.requestor_user_id})`,
        }));
        setRequests(requestsWithUserNames);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load affiliate requests",
        });
        setRequests([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    },
    [currentEnvironment]
  );

  // Fetch data sequence
  useEffect(() => {
    const fetchData = async () => {
      const mapping = await fetchUsers();
      setUserMapping(mapping);
      await fetchRequests(mapping);
    };

    fetchData();
  }, [fetchUsers, fetchRequests, currentEnvironment]);

  useEffect(() => {
    let result = [...requests];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (request) =>
          request.user_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.request_id.toString().includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (
        aValue === undefined ||
        bValue === undefined ||
        aValue === null ||
        bValue === null
      )
        return 0;

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRequests(result);
  }, [requests, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof AffiliateRequestItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCreateRequest = async (userId: string) => {
    try {
      const response = await api.fetch(
        "/api/grpc/affiliate/create-affiliate-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to create request: ${data.message}`);
      }
      toast({
        title: "Request Created",
        description: `The affiliate request has been created successfully. ${data.status}`,
        duration: 5000,
      });
      setIsDialogOpen(false);
      // Refresh requests after creation
      fetchRequests(userMapping);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to create request",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while creating the affiliate request.",
      });
      console.error("Failed to create request:", error);
    }
  };

  const handleStatusUpdate = async (
    requestId: number,
    newStatus: AffiliateRequestStatus,
    approverUserId?: string
  ) => {
    try {
      const response = await api.fetch(
        "/api/grpc/affiliate/update-affiliate-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestId,
            status: newStatus,
            approver_user_id: approverUserId,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to update request: ${data.message}`);
      }
      toast({
        title: "Request Updated",
        description: `The affiliate request has been ${newStatus.toLowerCase()}.`,
        duration: 5000,
      });
      // Refresh requests after update
      fetchRequests(userMapping);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to update request",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the affiliate request.",
      });
      console.error("Failed to update request:", error);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Affiliate Requests</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" size={16} />
          Create Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="REQUESTED">Requested</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => fetchRequests(userMapping)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("request_id")}
              >
                <div className="flex items-center">
                  ID{" "}
                  {sortField === "request_id" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    ))}
                </div>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status{" "}
                  {sortField === "status" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("requested_at")}
              >
                <div className="flex items-center">
                  Requested At{" "}
                  {sortField === "requested_at" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    ))}
                </div>
              </TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead>Approved At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-500"
                >
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell className="font-medium">
                    <CopyTooltip
                      prefix="#"
                      content={request.request_id.toString()}
                      triggerContent={request.request_id.toString()}
                    />
                  </TableCell>
                  <TableCell>
                    {request.user_name || `User ${request.requestor_user_id}`}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        request.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : request.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatProtoTimestamp(request.requested_at)}
                  </TableCell>
                  <TableCell>{request.approved_by || "-"}</TableCell>
                  <TableCell>
                    {request.approved_at
                      ? formatProtoTimestamp(request.approved_at)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <ActionButtons
                      request={request}
                      adminUserId={user?.uid}
                      onUpdate={handleStatusUpdate}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateRequestDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreate={handleCreateRequest}
        userMapping={userMapping} // Pass mapping to dialog
      />
    </motion.div>
  );
}
