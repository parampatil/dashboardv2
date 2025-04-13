// app/dashboard/mp2/add-to-jail/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddToJail() {
  const [userId, setUserId] = useState("");
  const [jailTime, setJailTime] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const api = useApi();

  const handleAddToJail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.fetch("/api/grpc/mp2/check-user-status", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();

      if (data.isInJail) {
        toast({
          variant: "destructive",
          title: "User already in jail",
          description: "This user is already serving jail time.",
        });
        return;
      }

      await api.fetch("/api/grpc/mp2/set-jail-time", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          jail_time_seconds: parseInt(jailTime) * 60,
        }),
      });

      toast({
        title: "User added to jail",
        description: "The user has been successfully added to jail.",
      });

      setUserId("");
      setJailTime("");
      setReason("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add user to jail",
        description: (error as Error).message,
      });
    }
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/mpsquare/add-to-jail"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add User to Jail</h1>
          <form onSubmit={handleAddToJail} className="space-y-4">
            <Input
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Jail time in minutes"
              value={jailTime}
              onChange={(e) => setJailTime(e.target.value)}
              required
            />
            <Textarea
              placeholder="Reason for jail time"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <Button type="submit">Add to Jail</Button>
          </form>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}

