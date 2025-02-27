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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { User } from "@/types/grpc";

export default function Dashboard1() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Add a cleanup function
    let mounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/grpc/users?page=${currentPage}&pageSize=${pageSize}`);
        const data = await response.json();
        if (mounted) {
          setUsers(data.users);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
      if (mounted) setLoading(false);
    };

    fetchUsers();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [currentPage, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleViewUserDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    setDrawerOpen(true);

    try {
      const response = await fetch("/api/grpc/users/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      setUserDetails(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user details",
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


  return (
    <ProtectedRoute allowedRoutes={["/dashboard/users/all-users"]}>
    <motion.div
      className="space-y-2 flex flex-col h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex justify-between items-center"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
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
