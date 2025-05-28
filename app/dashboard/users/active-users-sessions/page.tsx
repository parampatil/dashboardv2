"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, RefreshCw, Search, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ActiveUser } from "@/types/grpc";
import { cn } from "@/lib/utils";
import CopyTooltip from "@/components/ui/CopyToolTip";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/useApi";

export default function ActiveUsersPage() {
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ActiveUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const api = useApi();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.fetch("/api/grpc/one-guard/get-active-users");
      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch active users",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_id.toString().includes(searchQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleRevoke = async (userId: number) => {
    try {
      const response = await api.fetch("/api/grpc/one-guard/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to revoke session");

      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      toast({ title: "Success", description: "Session revoked successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/users/active-users-sessions"]}>
      <div className="p-6 space-y-6 bg-background rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Active Sessions
            </h1>
            <Badge>{users.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage currently authenticated user sessions
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={cn("group hover:bg-muted/50", "border-border")}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <CopyTooltip
                          triggerContent={user.user_id.toString()}
                          content={user.user_id.toString()}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(user.user_id)}
                        className="gap-1.5"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Revoke</span>
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center border rounded-lg"
          >
            <div className="mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No active sessions</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No users match your search criteria
            </p>
          </motion.div>
        )}

        {loading && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
