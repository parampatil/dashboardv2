// app/dashboard/affiliate/affiliate-requests/create-affiliate-request/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, UserCheck } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { UserIdNameMapping } from "@/types/grpc";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateAffiliateRequestPage() {
  const [userMapping, setUserMapping] = useState<UserIdNameMapping>({});
  const [filteredUsers, setFilteredUsers] = useState<
    [string, string | undefined][]
  >([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);

  const api = useApi();
  const router = useRouter();

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await api.fetch("/api/grpc/profile/search-users");
      const data = await response.json();
      const mapping = data.userIdsAndNames || {};
      setUserMapping(mapping);
      setFilteredUsers(Object.entries(mapping));
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to fetch users",
        description: error instanceof Error ? error.message : "An error occurred while fetching users.",
      });
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by username or user ID
  useEffect(() => {
    const entries = Object.entries(userMapping);
    if (!search) {
      setFilteredUsers(entries);
    } else {
      setFilteredUsers(
        entries.filter(
          ([userId, userName]) =>
            userId.toLowerCase().includes(search.toLowerCase()) ||
            (userName && userName.toLowerCase().includes(search.toLowerCase()))
        )
      );
    }
  }, [search, userMapping]);

  // Create request handler
  const handleCreateRequest = async () => {
    if (!selectedUserId) return;
    setCreating(true);
    try {
      const response = await api.fetch(
        "/api/grpc/affiliate/create-affiliate-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: selectedUserId }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create request");
      toast({
        title: "Request Created",
        description: "The affiliate request has been created successfully.",
      });
      router.push("/dashboard/affiliate/affiliate-requests");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to create request",
        description: error instanceof Error ? error.message : "An error occurred.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-grow bg-white rounded-xl shadow-lg p-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Create Affiliate Request
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Selected User and Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-4 h-fit"
        >
          <div className="w-full mb-8">
            <div className="text-lg font-semibold text-green-700 mb-2">
              Selected User
            </div>
            <div className="border rounded-lg px-4 py-4 min-h-[64px] flex items-center bg-green-50">
              {selectedUserId ? (
                <div>
                  <div className="font-semibold text-lg text-green-900">
                    {userMapping[selectedUserId] || selectedUserId}
                  </div>
                  <div className="text-xs text-green-600">
                    ID: {selectedUserId}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">No user selected</span>
              )}
            </div>
          </div>
          <Button
            className="w-full py-4 text-lg rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl hover:shadow-sm hover:opacity-90 transition-all duration-300"
            onClick={handleCreateRequest}
            disabled={!selectedUserId || creating}
          >
            {creating ? <Loader2 className="animate-spin mr-2" /> : null}
            Create Affiliate Request
          </Button>
        </motion.div>

        {/* User List */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md p-4">
          <label className="mb-2 font-semibold text-blue-700 text-lg">
            Select User
          </label>
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
              size={18}
            />
            <Input
              placeholder="Search by name or user ID..."
              className="pl-10 rounded-full border-blue-200 focus:ring-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loadingUsers}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100 max-h-[70vh] overflow-x-hidden">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12 text-blue-400">
                <Loader2 className="animate-spin mr-2" /> Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No users found
              </div>
            ) : (
              <motion.ul
                layout
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.04 },
                  },
                }}
                className="space-y-2"
              >
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map(([userId, userName]) => (
                    <motion.li
                      layout
                      key={userId}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      }}
                      className="w-full"
                    >
                      <Button
                        variant={
                          selectedUserId === userId ? "default" : "outline"
                        }
                        className={`
          w-full flex items-center justify-between rounded-xl transition-all
          px-6 py-4
          text-base
          bg-white
          border border-gray-200
          shadow-sm
          hover:bg-blue-50 hover:border-blue-300
          ${
            selectedUserId === userId
              ? "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-400 text-blue-900 shadow-md"
              : ""
          }
        `}
                        style={{ minHeight: "64px" }}
                        onClick={() => setSelectedUserId(userId)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-gray-800 truncate">
                            {userName || userId}
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">
                            ID: {userId}
                          </span>
                        </div>
                        {selectedUserId === userId && (
                          <motion.span
                            key="selected"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            className="ml-4 text-green-600"
                          >
                            <UserCheck size={24} />
                          </motion.span>
                        )}
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
