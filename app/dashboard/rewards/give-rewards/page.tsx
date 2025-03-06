// app/dashboard/rewards/give-rewards/page.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { RewardForm } from "../RewardForm";

const GiveReward = () => {
  return (
    <ProtectedRoute allowedRoutes={["/dashboard/rewards/give-rewards"]}>
      <motion.div
        className="space-y-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Give Reward</h1>
          <RewardForm />
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default GiveReward;
