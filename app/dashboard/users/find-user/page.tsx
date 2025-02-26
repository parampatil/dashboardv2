// app/dashboard/users/find-user/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserDetails } from "@/components/UsersDashboard/UserDetails";
import { useSearchParams } from "next/navigation";

export default function FindUser() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Check for userId in URL params and auto-search if present
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      setUserId(userIdParam);
      handleSearch(userIdParam);
    }
  }, [searchParams]);

  const handleSearch = async (id: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/grpc/users/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      setUserData(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(userId);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Find User</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {userData && <UserDetails userData={userData} />}
    </motion.div>
  );
}
