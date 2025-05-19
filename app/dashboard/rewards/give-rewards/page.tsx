"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import CopyTooltip from "@/components/ui/CopyToolTip";
import { useApi } from "@/hooks/useApi";

// --- Types ---
interface UserIdNameMapping {
  userIdsAndNames: Record<string, string>;
}
interface Reward {
  rewardId: string;
  rewardName: string;
  points?: number;
  amount?: number;
}
interface RewardResponse {
  rewards: Reward[];
}

// --- Animation Variants ---
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.18}
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } }
};

export default function RewardsPage() {
  const [usersData, setUsersData] = useState<UserIdNameMapping | null>(null);
  const [rewardsData, setRewardsData] = useState<RewardResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const { toast } = useToast();
  const api = useApi();

  // Fetch users and rewards on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.fetch("/api/grpc/profile/search-users").then((r) => r.json()),
      api.fetch("/api/grpc/rewards/available").then((r) => r.json()),
    ])
      .then(([users, rewards]) => {
        setUsersData(users as UserIdNameMapping);
        setRewardsData(rewards as RewardResponse);
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Error loading data" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  // Memoized filtered user IDs
  const filteredUserIds = useMemo(() => {
    if (!usersData?.userIdsAndNames) return [];
    const q = searchQuery.trim().toLowerCase();
    
    if (!q) {
      // Sort alphabetically by name when search is empty
      return Object.entries(usersData.userIdsAndNames)
        .sort(([, nameA], [, nameB]) => (nameA || "").localeCompare(nameB || ""))
        .map(([id]) => id);
    }
    
    return Object.entries(usersData.userIdsAndNames)
      .filter(
        ([id, name]) =>
          id.toLowerCase().includes(q) ||
          (name || "").toLowerCase().includes(q)
      )
      .map(([id]) => id);
  }, [searchQuery, usersData]);

  // Assign reward handler
  const assignReward = async (userId: string, rewardId: string) => {
    setAssigning(userId + rewardId);
    try {
      const response = await api.fetch("/api/grpc/rewards/give-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rewardId }),
      });
      if (response.ok) {
        toast({ variant: "success", title: "Reward assigned successfully" });
      } else {
        toast({ variant: "destructive", title: "Failed to assign reward" });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to assign reward" });
    }
    setAssigning(null);
  };

  return (
    <div className="p-6 mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Gift className="text-pink-500" /> Give Rewards
      </h1>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Input
          placeholder="Search by User ID or Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </motion.div>
      <div className="overflow-x-auto overflow-y-hidden">
        <Table className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>User</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* <AnimatePresence mode="popLayout"> */}
              {filteredUserIds.map((userId, idx) => (
                <motion.tr
                  key={userId}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-lg shadow-sm">
                        {usersData?.userIdsAndNames?.[userId]?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{usersData?.userIdsAndNames?.[userId] || "-"}</div>
                        <CopyTooltip
                          content={userId}
                          triggerContent={
                            <span className="text-xs text-gray-400 font-mono underline cursor-pointer hover:text-pink-600">
                              {userId}
                            </span>
                          }
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-full px-4 py-2 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-pink-500" /> Give Reward
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl shadow-lg">
                        {(rewardsData?.rewards || []).map((reward) => (
                          <DropdownMenuItem
                            key={reward.rewardId}
                            onSelect={() => assignReward(userId, reward.rewardId)}
                            className="flex items-center gap-2"
                            disabled={assigning === userId + reward.rewardId}
                          >
                            <Gift className="w-4 h-4 text-pink-400" />
                            <span className="flex-1">
                              {reward.rewardName}
                              <span className="ml-2 text-xs text-gray-400">
                                {reward.points ?? reward.amount ?? ""} min
                              </span>
                            </span>
                            {assigning === userId + reward.rewardId && (
                              <span className="ml-2 animate-spin text-pink-500">&#9696;</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                        {(rewardsData?.rewards?.length ?? 0) === 0 && (
                          <DropdownMenuItem disabled>No rewards available</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            {/* </AnimatePresence> */}
          </TableBody>
        </Table>
      </div>
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-400"></span>
        </motion.div>
      )}
      {!loading && filteredUserIds.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 text-gray-400">
          No users found.
        </motion.div>
      )}
    </div>
  );
}
