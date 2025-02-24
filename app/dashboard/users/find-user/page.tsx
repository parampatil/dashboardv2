// app/dashboard/users/find-user/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatProtobufTimestamp } from "@/lib/utils";
import { UserDetailsResponse, ProviderBalanceResponse } from "@/types/grpc";

interface UserSearchResult {
  user: UserDetailsResponse['user'];
  consumerPurchaseBalance: number;
  providerBalance: ProviderBalanceResponse;
}

export default function FindUser() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserSearchResult | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/grpc/user/details", {
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
      console.log(data);
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

      {userData && (
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Details Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">User Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Display Name" value={userData.user.displayName} />
                <InfoField label="Email" value={userData.user.email} />
                <InfoField label="User Type" value={userData.user.userType} />
                <InfoField label="Country" value={userData.user.country} />
                <InfoField label="Phone" value={userData.user.phoneNumber || "N/A"} />
                <InfoField label="Username" value={userData.user.userName} />
                <InfoField
                  label="Created At"
                  value={formatProtobufTimestamp(userData.user.createdTimestamp)}
                />
                <InfoField
                  label="Updated At"
                  value={formatProtobufTimestamp(userData.user.lastUpdatedTimestamp)}
                />
              </div>
            </div>

            {/* Balance Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Balance Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Consumer Purchase Balance</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {userData.consumerPurchaseBalance} Min
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Provider Earning Balance</p>
                  <p className="text-2xl font-bold text-green-700">
                    {userData.providerBalance.currency} {userData.providerBalance.providerEarningBalance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Helper component for displaying info fields
const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
