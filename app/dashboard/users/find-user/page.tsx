"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
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
import { DeleteUserButton } from "@/components/UsersDashboard/DeleteUserButton";
import { RestoreUserButton } from "@/components/UsersDashboard/RestoreUserButton";

export default function FindUserComponent() {
  const [searchMethod, setSearchMethod] = useState<"email" | "id">("email");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [usersVersion, setUsersVersion] = useState(0); // State to trigger re-fetching
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

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
  }, [currentEnvironment]);

  const fetchUsersByEmail = useCallback(async (prefix: string) => {
    if (prefix.length < 3) return;
    setLoading(true);
    try {
      const response = await api.fetch(
        "/api/grpc/profile/getUserDetailsByEmail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_prefix: prefix }),
        }
      );
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
  }, [currentEnvironment]);

const debouncedFetchUsersByEmail = useMemo(
  () => debounce((prefix: string) => fetchUsersByEmail(prefix), 500),
  [fetchUsersByEmail]
);

const debouncedFetchUsersById = useMemo(
  () => debounce((userId: string) => fetchUserById(userId), 500),
  [fetchUserById]
);


  useEffect(() => {
    if (searchMethod === "email" && searchInput.length >= 3) {
      debouncedFetchUsersByEmail(searchInput);
    } else if (searchMethod === "id" && searchInput) {
      debouncedFetchUsersById(searchInput);
    } else {
      setUsers([]);
    }
  }, [
    searchInput,
    searchMethod,
    debouncedFetchUsersByEmail,
    debouncedFetchUsersById,
    usersVersion,
  ]);

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
        throw new Error(data.error.details || data.error.errorMessage);
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

  const usersWithViewButton = users.map((user) => ({
    ...user,
    viewButton: (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewUserDetails(user.userId)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center"
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    ),
    deleteButton: <DeleteUserButton userId={user.userId} />,
    restoreButton: <RestoreUserButton userId={user.userId} />,
  }));

  const handleTabChange = (value: string) => {
    setSearchMethod(value as "id" | "email");
    setSearchInput("");
    setUsers([]);
  };

  const handleUpdate = () => {
    setUsersVersion((prev) => prev + 1); // Increment version to trigger re-fetching
    setDrawerOpen(false);
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
              <TabsTrigger value="email">Find by Email</TabsTrigger>
              <TabsTrigger value="id">Find by ID</TabsTrigger>
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

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>)}
          {!loading && users.length > 0 && (
            <>
              <motion.div
                className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 15 }}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex flex-wrap gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex items-center justify-between  bg-white border border-gray-100 rounded-md px-3 py-2 gap-4"
                    >
                      <span className="text-gray-500">Total Users Found</span>
                      <span className="mt-1 text-xl font-extrabold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
                        {loading ? "..." : users.length}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-md px-3 py-2 gap-4"
                    >
                      <span className="text-gray-500">360 Users</span>
                      <span className="mt-1 text-xl font-extrabold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        {loading
                          ? "..."
                          : users.filter((user) =>
                              user.email?.includes("@360world.com")
                            ).length}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.19 }}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-md px-3 py-2 gap-4"
                    >
                      <span className="text-gray-500">Non-360 Users</span>
                      <span className="mt-1 text-xl font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {loading
                          ? "..."
                          : users.filter(
                              (user) => !user.email?.includes("@360world.com")
                            ).length}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              <UserTable
                users={usersWithViewButton}
                loading={false}
                currentPage={1}
                pageSize={users.length}
                selectedUserId={selectedUserId}
              />
            </>
          )}
          {!loading && users.length === 0 && searchInput && (
            <p>No users found</p>
          )}
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-screen !select-text">
            <DrawerHeader className="bg-cyan-100 flex justify-between items-center">
              <div>
                <DrawerTitle>User Details</DrawerTitle>
                <DrawerDescription data-vaul-no-drag="true">
                  Viewing details for user ID: {selectedUserId}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" aria-label="Close">
                  ✕
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 py-2 overflow-y-auto">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                userDetails && (
                  <UserDetails
                    userData={userDetails}
                    onProfileUpdate={handleUpdate}
                  />
                )
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
