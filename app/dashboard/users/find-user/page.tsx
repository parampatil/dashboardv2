"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { UserDetails } from "@/components/UsersDashboard/UserDetails";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserTable from "@/components/UsersDashboard/UserTable";
import { User } from "@/types/grpc";
import { Eye } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import debounce from "lodash/debounce";

export default function FindUserComponent() {
  const [searchMethod, setSearchMethod] = useState<"id" | "email">("id");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const fetchUserById = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/users/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error.details || data.error.errorMessage);
      }
  
      setUsers([data.user]);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsersByEmail = useCallback(async (prefix: string) => {
    if (prefix.length < 3) return;
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/profile/getUserDetailsByEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_prefix: prefix }),
      });
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error.details || data.error.errorMessage);
      }
  
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchUsers = useCallback((prefix: string) => {
    debounce(() => fetchUsersByEmail(prefix), 300)();
  }, [fetchUsersByEmail]);

  useEffect(() => {
    if (searchMethod === "email" && searchInput.length >= 3) {
      debouncedFetchUsers(searchInput);
    } else if (searchMethod === "id" && searchInput) {
      fetchUserById(searchInput);
    } else {
      setUsers([]);
    }
  }, [searchInput, searchMethod, debouncedFetchUsers, fetchUserById]);

  const handleViewUserDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    setDrawerOpen(true);

    try {
      const response = await api.fetch("/api/grpc/users/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.details || data.error.errorMessage)
      }

      setUserDetails(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
      setDrawerOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const usersWithViewButton = users.map(user => ({
    ...user,
    viewButton: (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleViewUserDetails(user.userId)}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    )
  }));

  const handleTabChange = (value: string) => {
    setSearchMethod(value as "id" | "email");
    setSearchInput("");
    setUsers([]);
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/users/find-user"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Find User</h1>
          <Tabs value={searchMethod} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="id">Find by ID</TabsTrigger>
              <TabsTrigger value="email">Find by Email</TabsTrigger>
            </TabsList>
            <TabsContent value="id">
              <Input
                type="text"
                placeholder="Enter user ID"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="mb-4"
              />
            </TabsContent>
            <TabsContent value="email">
              <Input
                type="text"
                placeholder="Enter email prefix (min 3 characters)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="mb-4"
              />
            </TabsContent>
          </Tabs>
          {loading && <p>Loading...</p>}
          {!loading && users.length > 0 && (
            <UserTable
              users={usersWithViewButton}
              loading={false}
              currentPage={1}
              pageSize={users.length}
              selectedUserId={selectedUserId}
            />
          )}
          {!loading && users.length === 0 && searchInput && (
            <p>No users found</p>
          )}
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="bg-cyan-100">
              <DrawerTitle>User Details</DrawerTitle>
              <DrawerDescription>
                Viewing details for user ID: {selectedUserId}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2 overflow-y-auto">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                userDetails && <UserDetails userData={userDetails} />
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </motion.div>
    </ProtectedRoute>
  );
}
