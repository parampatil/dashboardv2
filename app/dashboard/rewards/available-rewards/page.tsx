// app/dashboard/rewards/available-rewards/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Reward } from "@/types/grpc";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { RewardForm } from "../RewardForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AvailableRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch("/api/grpc/rewards/available");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error.details || data.error.errorMessage);
        }
        setRewards(data.rewards || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch available rewards",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [toast]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/rewards/available-rewards"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Available Rewards
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : rewards.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {rewards.map((reward, index) => (
                <RewardCard
                  key={reward.rewardId}
                  reward={reward}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No rewards available at the moment.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}

function RewardCard({ reward, index }: { reward: Reward; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      variants={itemVariants}
      whileHover={{
        y: -10,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
      }}
    >
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
        <h3 className="text-lg font-semibold text-white capitalize">
          {reward.rewardName}
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-gray-600">{reward.rewardDescription}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Amount</p>
            <p className="text-xl font-bold text-blue-700">
              {reward.amount} Min
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Rate</p>
            <p className="text-xl font-bold text-green-700">
              {reward.rate} {reward.currency}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs text-gray-500">Reward ID: {reward.rewardId}</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Give Reward</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Give Reward: {reward.rewardName}</DialogTitle>
            </DialogHeader>
            <RewardForm initialRewardId={reward.rewardId.toString()} onClose={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
