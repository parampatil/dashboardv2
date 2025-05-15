// components/UsersDashboard/UserDetails.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatProtobufTimestamp } from "@/lib/utils";
import {
  UserDetailsResponse,
  GetProviderEarningBalanceResponse,
  UpdateUserDetailsRequest,
  ConsumerPurchaseTransaction,
  ProviderEarningTransaction,
} from "@/types/grpc";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { TransactionHistorySection } from "./TransactionHistorySection";
import { CallHistoryTabs } from "@/components/UsersDashboard/CallHistoryTabs";
import { DeleteUserButton } from "@/components/UsersDashboard/DeleteUserButton";

interface UserDetailsProps {
  userData: {
    user: UserDetailsResponse["user"];
    consumerPurchaseBalance: number;
    providerBalance: GetProviderEarningBalanceResponse;
  };
  onProfileUpdate: () => void;
}

export function UserDetails({ userData, onProfileUpdate }: UserDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDetailsRequest>({
    userId: Number(userData.user.userId),
    userName: userData.user.userName || "",
    firstName: userData.user.firstName || "",
    lastName: userData.user.lastName || "",
    email: userData.user.email || "",
    phoneNumber: userData.user.phoneNumber || "",
    country: userData.user.country || "",
    isActive: userData.user.isActive || false,
    updatedBy: "admin", // Replace with actual admin ID
  });

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

  useEffect(() => {
    setFormData({
      userId: Number(userData.user.userId),
      userName: userData.user.userName || "",
      firstName: userData.user.firstName || "",
      lastName: userData.user.lastName || "",
      email: userData.user.email || "",
      phoneNumber: userData.user.phoneNumber || "",
      country: userData.user.country || "",
      isActive: userData.user.isActive || false,
      updatedBy: "admin",
    });
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.fetch(
        "/api/grpc/profile/update-user-details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "User details updated successfully",
        });
        onProfileUpdate();
        setIsEditing(false);
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description:
            result.message || "An error occurred while updating user details",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user details",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* User Details Section - Updated with edit functionality */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Details</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
                size="sm"
              >
                {isEditing ? "Cancel" : "Edit Details"}
              </Button>
              <DeleteUserButton userId={userData.user.userId} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <EditableField
              label="Username"
              name="userName"
              value={formData.userName || ""}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <EditableField
              label="Email"
              name="email"
              value={formData.email || ""}
              isEditing={isEditing}
              onChange={handleInputChange}
              required
              type="email"
            />
            <EditableField
              label="First Name"
              name="firstName"
              value={formData.firstName || ""}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <EditableField
              label="Last Name"
              name="lastName"
              value={formData.lastName || ""}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <EditableField
              label="Phone"
              name="phoneNumber"
              value={formData.phoneNumber || "N/A"}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <EditableField
              label="Country"
              name="country"
              value={formData.country || "N/A"}
              isEditing={isEditing}
              onChange={handleInputChange}
            />

            <div className="col-span-2">
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
              {isEditing && (
                <div className="mt-4 flex items-center gap-2">
                  <label className="text-sm text-gray-500">
                    Account Status
                  </label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <span>{formData.isActive ? "Active" : "Inactive"}</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="col-span-2 mt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Existing Balance Information Section remains unchanged */}
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

      {/* Existing Transaction History and Call History sections remain unchanged */}
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

      <TransactionHistorySection
        purchaseHistory={purchaseHistory}
        earningTransactions={earningTransactions}
        loadingHistory={loadingHistory}
        loadingTransactions={loadingTransactions}
      />

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Call History</h3>
        <CallHistoryTabs userId={userData.user.userId} />
      </div>
    </motion.div>
  );
}

const EditableField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string | number;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    {isEditing ? (
      <Input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        className="w-full"
      />
    ) : (
      <p className="font-medium">{value}</p>
    )}
  </div>
);

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
