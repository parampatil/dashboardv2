// app/dashboard/location/blacklist-user/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { Plus, Trash2 } from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BlacklistUser() {
  const [blacklistedUsers, setBlacklistedUsers] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isRemovingUser, setIsRemovingUser] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchBlacklistedUsers = async () => {
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/location/blacklisted-users");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch blacklisted users");
      }
      
      const data = await response.json();
      console.log("Blacklisted Users", data);
      setBlacklistedUsers(data.userIds || []);
      setFilteredUsers(data.userIds || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch blacklisted users",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklistedUsers();
  }, [currentEnvironment]);

  useEffect(() => {
    const filtered = blacklistedUsers.filter((userId) => {
      return userIdFilter ? userId.includes(userIdFilter) : true;
    });
    setFilteredUsers(filtered);
  }, [userIdFilter, blacklistedUsers]);

  const handleAddUser = async () => {
    if (!newUserId.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "User ID is required",
      });
      return;
    }

    setIsAddingUser(true);
    try {
      const response = await api.fetch("/api/grpc/location/blacklist-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: newUserId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to blacklist user");
      }

      toast({
        title: "Success",
        description: `User ${newUserId} has been blacklisted`,
      });

      setNewUserId("");
      fetchBlacklistedUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to blacklist user",
        description: (error as Error).message,
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;

    setIsRemovingUser(true);
    try {
      const response = await api.fetch("/api/grpc/location/unblacklist-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userToRemove }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unblacklist user");
      }

      toast({
        title: "Success",
        description: `User ${userToRemove} has been removed from blacklist`,
      });

      setUserToRemove(null);
      fetchBlacklistedUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to unblacklist user",
        description: (error as Error).message,
      });
    } finally {
      setIsRemovingUser(false);
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/location/blacklist-user"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            User Blacklist Management
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add User to Blacklist</CardTitle>
              <CardDescription>
                Enter a user ID to add them to the blacklist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter User ID"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddUser} 
                  disabled={isAddingUser}
                  className="flex items-center"
                >
                  {isAddingUser ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Blacklist User
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <Input
              placeholder="Filter by User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-full md:w-1/3"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80%]">User ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      No blacklisted users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userId, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{userId}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setUserToRemove(userId)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Remove
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Removal</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove user {userToRemove} from the blacklist?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setUserToRemove(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleRemoveUser}
                                disabled={isRemovingUser}
                              >
                                {isRemovingUser ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Remove
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}

