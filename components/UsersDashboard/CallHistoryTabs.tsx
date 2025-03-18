// components/UsersDashboard/CallHistoryTabs.tsx
"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { CallTransaction } from "@/types/grpc";
import { Phone, Clock, MapPin, Tag, DollarSign } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface CallHistoryTabsProps {
  userId: string;
}

export function CallHistoryTabs({ userId }: CallHistoryTabsProps) {
  const [consumerCalls, setConsumerCalls] = useState<CallTransaction[]>([]);
  const [providerCalls, setProviderCalls] = useState<CallTransaction[]>([]);
  const [loadingConsumer, setLoadingConsumer] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const fetchConsumerCallHistory = async () => {
    setLoadingConsumer(true);
    try {
      const response = await api.fetch("/api/grpc/users/consumer-call-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ consumerId: parseInt(userId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch consumer call history");
      }

      const data = await response.json();
      setConsumerCalls(data.callHistory || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch consumer call history",
        description: (error as Error).message,
      });
    } finally {
      setLoadingConsumer(false);
    }
  };

  const fetchProviderCallHistory = async () => {
    setLoadingProvider(true);
    try {
      const response = await api.fetch("/api/grpc/users/provider-call-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId: parseInt(userId) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch provider call history");
      }

      const data = await response.json();
      setProviderCalls(data.callHistory || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch provider call history",
        description: (error as Error).message,
      });
    } finally {
      setLoadingProvider(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConsumerCallHistory();
      fetchProviderCallHistory();
    }
  }, [userId]);

  const renderCallHistory = (calls: CallTransaction[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (calls.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No call history found.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {calls.map((call, index) => (
          <div
            key={index}
            // key={call.callId} ! // Uncomment this line if callId is unique and available
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">Call ID: {call.callId}</span>
              </div>
              <span className="text-sm text-gray-500">
                {format(
                  new Date(
                    call.timestamp.seconds * 1000 +
                      call.timestamp.nanos / 1000000
                  ),
                  "MMM d, yyyy h:mm a"
                )}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span>{formatDuration(call.durationSeconds)}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span>{call.location || "Unknown location"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Tag className="h-4 w-4 text-gray-500 mr-2" />
                <span>{call.context || "No context"}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                <span>{call.charge} credits</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="consumer" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="consumer">
          Consumer Calls ({consumerCalls.length})
        </TabsTrigger>
        <TabsTrigger value="provider">
          Provider Calls ({providerCalls.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="consumer" className="mt-4">
        {renderCallHistory(consumerCalls, loadingConsumer)}
      </TabsContent>
      <TabsContent value="provider" className="mt-4">
        {renderCallHistory(providerCalls, loadingProvider)}
      </TabsContent>
    </Tabs>
  );
}
