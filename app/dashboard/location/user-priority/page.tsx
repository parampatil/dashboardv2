// app/dashboard/location/user-priority/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { ArrowUpDown } from "lucide-react";
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

interface PriorityItem {
  userId: number;
  priority: number;
}

type SortDirection = "asc" | "desc";

export default function UserPriority() {
  const [priorityList, setPriorityList] = useState<PriorityItem[]>([]);
  const [filteredData, setFilteredData] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortField, setSortField] = useState<"userId" | "priority">("userId");

  const { toast } = useToast();
  const api = useApi();
  const { currentEnvironment } = useEnvironment();

  const fetchPriorityList = async () => {
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/location/priority-list");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch priority list");
      }
      
      const data = await response.json();
      
      // Transform the data
      const transformedData: PriorityItem[] = Object.entries(data.priorityList || {}).map(
        ([userId, priority]) => ({
          userId: Number(userId),
          priority: Number(priority),
        })
      );
      
      
      setPriorityList(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch priority list",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityList();
  }, [currentEnvironment]);

  useEffect(() => {
    const filtered = priorityList.filter((item) => {
      // Convert to string for filtering if userIdFilter is provided
      return userIdFilter ? String(item.userId).includes(userIdFilter) : true;
    });
  
    // Sort the data numerically
    filtered.sort((a, b) => {
      if (sortField === "userId") {
        return sortDirection === "asc" ? a.userId - b.userId : b.userId - a.userId;
      } else {
        return sortDirection === "asc" ? a.priority - b.priority : b.priority - a.priority;
      }
    });
  
    setFilteredData(filtered);
  }, [userIdFilter, priorityList, sortField, sortDirection]);

  const handleSort = (field: "userId" | "priority") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/location/user-priority"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            User Priority List
          </h1>

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
                  <TableHead className="w-[50%]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("userId")}
                      className="flex items-center p-0"
                    >
                      User ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("priority")}
                      className="flex items-center p-0"
                    >
                      Priority
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
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
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      No priority data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.userId}</TableCell>
                      <TableCell>{item.priority}</TableCell>
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
