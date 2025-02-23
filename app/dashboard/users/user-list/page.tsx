// app/dashboard/dashboard1/page.tsx
"use client";
import { useState, useEffect } from "react";
import UserTable from "@/components/UsersDashboard/UserTable";
import Pagination from "@/components/UsersDashboard/Pagination";
import { PageSizeSelector } from "@/components/UsersDashboard/PageSizeSelector";
import { motion } from "framer-motion";

export default function Dashboard1() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);

  // app/dashboard/dashboard1/page.tsx
useEffect(() => {
  // Add a cleanup function
  let mounted = true;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/grpc/profile?page=${currentPage}&pageSize=${pageSize}`);
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

  return (
    <motion.div
      className="p-6 space-y-6 flex flex-col h-full"
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
        users={users}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
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
    </motion.div>
  );
}
