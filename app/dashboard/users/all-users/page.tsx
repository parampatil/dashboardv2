// app/dashboard/users/all-users/page.tsx
"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserTable from "@/components/UsersDashboard/UserTable";
import Pagination from "@/components/UsersDashboard/Pagination";
import { PageSizeSelector } from "@/components/UsersDashboard/PageSizeSelector";
import { motion } from "framer-motion";
import { UserDetails } from "@/components/UsersDashboard/UserDetails";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DeleteUserButton } from "@/components/UsersDashboard/DeleteUserButton";
import { RestoreUserButton } from "@/components/UsersDashboard/RestoreUserButton";

import { User } from "@/types/grpc";
import { useEnvironment } from "@/context/EnvironmentContext";
import UserStats from "@/components/UsersDashboard/UserStats";

export default function Dashboard1() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersVersion, setUsersVersion] = useState(0); // State to trigger re-fetching
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();
  const api = useApi();
  const {currentEnvironment} = useEnvironment();

  useEffect(() => {
    // Add a cleanup function
    let mounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.fetch(
          `/api/grpc/users/all-users/?page=${currentPage}&pageSize=${pageSize}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error.details || data.error.errorMessage);
        }
        if (mounted) {
          setUsers(data.users);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch users",
          description: (error as Error).message,
        });
      }
      if (mounted) setLoading(false);
    };

    fetchUsers();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [currentPage, pageSize, usersVersion, currentEnvironment]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleViewUserDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    setDrawerOpen(true);

    try {
      const response = await api.fetch("/api/grpc/users/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        title: "Failed to fetch user details",
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

  const handleUpdate = async () => {
    setUsersVersion((prev) => prev + 1); // Trigger users list refresh
    if (selectedUserId) {
      // Refresh the currently open user details
      await handleViewUserDetails(selectedUserId);
    }
  };

  
  return (
    <ProtectedRoute allowedRoutes={["/dashboard/users/all-users"]}>
      <motion.div
        className="space-y-2 flex flex-col h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
        >
          <div className="flex flex-col flex-1">
            <motion.div
              className="flex items-center justify-between mb-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
            >
              <h1 className="text-lg font-bold text-gray-800 mb-1">
                User Management
              </h1>
              <div className="flex-shrink-0">
                <PageSizeSelector
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </motion.div>
            <UserStats />
          </div>
        </motion.div>

        <UserTable
          users={usersWithViewButton}
          loading={loading}
          currentPage={currentPage}
          pageSize={pageSize}
          selectedUserId={selectedUserId}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>

        {/* User Details Drawer */}
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
