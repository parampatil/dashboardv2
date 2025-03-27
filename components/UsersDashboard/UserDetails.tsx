// components/UsersDashboard/UserDetails.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatProtobufTimestamp } from "@/lib/utils";
import {
  UserDetailsResponse,
  GetProviderEarningBalanceResponse,
  ConsumerPurchaseTransaction,
  ProviderEarningTransaction,
} from "@/types/grpc";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";

import { TransactionHistorySection } from "./TransactionHistorySection";
import { CallHistoryTabs } from "@/components/UsersDashboard/CallHistoryTabs";

interface UserDetailsProps {
  userData: {
    user: UserDetailsResponse["user"];
    consumerPurchaseBalance: number;
    providerBalance: GetProviderEarningBalanceResponse;
  };
}

export function UserDetails({ userData }: UserDetailsProps) {
  const [purchaseHistory, setPurchaseHistory] = useState<
    ConsumerPurchaseTransaction[] | null
  >(null);
  const [earningTransactions, setEarningTransactions] = useState<
    ProviderEarningTransaction[] | null
  >(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const fetchPurchaseHistory = async () => {
    if (!userData.user.userId) return;
    setLoadingHistory(true);

    try {
      const response = await api.fetch("/api/grpc/users/purchase-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData.user.userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase history");
      }

      const data = await response.json();
      setPurchaseHistory(data.consumerPurchaseHistory || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch purchase history",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchEarningTransactions = async () => {
    if (!userData.user.userId) return;
    setLoadingTransactions(true);

    try {
      const response = await api.fetch("/api/grpc/users/earning-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData.user.userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch earning transactions");
      }

      const data = await response.json();
      setEarningTransactions(data.providerEarningTransactions || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch earning transactions",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <motion.div
      className="bg-gray-50 rounded-lg shadow-lg p-6"
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
            <InfoField
              label="Phone"
              value={userData.user.phoneNumber || "N/A"}
            />
            <InfoField label="Username" value={userData.user.userName} />
            <InfoField
              label="Created At"
              value={formatProtobufTimestamp(userData.user.createdTimestamp)}
            />
            <InfoField
              label="Updated At"
              value={formatProtobufTimestamp(
                userData.user.lastUpdatedTimestamp
              )}
            />
          </div>
        </div>

        {/* Balance Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Balance Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Consumer Purchase Balance</p>
              {(() => {
                const totalMinutes = Math.floor(
                  userData.consumerPurchaseBalance
                );
                const totalSeconds = Math.round(
                  (userData.consumerPurchaseBalance - totalMinutes) * 60
                );
                return (
                  <p className="text-2xl font-bold text-blue-700">
                    {totalMinutes} Min {totalSeconds} Sec
                  </p>
                );
              })()}
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Provider Earning Balance</p>
              <p className="text-2xl font-bold text-green-700">
                {userData.providerBalance.currency}{" "}
                {userData.providerBalance.providerEarningBalance}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          onClick={fetchPurchaseHistory}
          disabled={loadingHistory}
          variant="outline"
        >
          {loadingHistory ? "Loading..." : "Fetch Purchase History"}
        </Button>
        <Button
          onClick={fetchEarningTransactions}
          disabled={loadingTransactions}
          variant="outline"
        >
          {loadingTransactions ? "Loading..." : "Fetch Earning Transactions"}
        </Button>
      </div>

      {/* Transaction History Tabs */}
      <TransactionHistorySection
        purchaseHistory={purchaseHistory}
        earningTransactions={earningTransactions}
        loadingHistory={loadingHistory}
        loadingTransactions={loadingTransactions}
      />

      {/* Call History Tabs */}
      <div className="mt-6">
  <h3 className="text-lg font-medium mb-4">Call History</h3>
  <CallHistoryTabs userId={userData.user.userId} />
</div>
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
