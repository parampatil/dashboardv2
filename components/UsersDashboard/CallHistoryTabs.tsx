// components/UsersDashboard/CallHistoryTabs.tsx
"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ConsumerCallHistory, ProviderCallHistory } from "@/types/grpc";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";

interface CallHistoryTabsProps {
  consumerCallHistory?: ConsumerCallHistory[];
  providerCallHistory?: ProviderCallHistory[];
  userId: string;
}

export function CallHistoryTabs({
  consumerCallHistory: initialConsumerCallHistory = [],
  providerCallHistory: initialProviderCallHistory = [],
  userId,
}: CallHistoryTabsProps) {
  const [consumerCallHistory, setConsumerCallHistory] = useState<ConsumerCallHistory[]>(initialConsumerCallHistory || []);
  const [providerCallHistory, setProviderCallHistory] = useState<ProviderCallHistory[]>(initialProviderCallHistory || []);
  const [isLoadingConsumer, setIsLoadingConsumer] = useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = useState(false);
  
  const { toast } = useToast();
  const api = useApi();

  // Sort call histories by date in descending order
  const sortedConsumerHistory = [...consumerCallHistory].sort((a, b) => {
    const dateA = new Date(
      a.timestamp?.seconds ? parseInt(a.timestamp.seconds) * 1000 : 0
    );
    const dateB = new Date(
      b.timestamp?.seconds ? parseInt(b.timestamp.seconds) * 1000 : 0
    );
    return dateB.getTime() - dateA.getTime();
  });

  const sortedProviderHistory = [...providerCallHistory].sort((a, b) => {
    const dateA = new Date(
      a.timestamp?.seconds ? parseInt(a.timestamp.seconds) * 1000 : 0
    );
    const dateB = new Date(
      b.timestamp?.seconds ? parseInt(b.timestamp.seconds) * 1000 : 0
    );
    return dateB.getTime() - dateA.getTime();
  });

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: { seconds?: string; nanos?: number }) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    const date = new Date(parseInt(timestamp.seconds) * 1000);
    return format(date, "MMM dd, yyyy HH:mm:ss");
  };

  // Convert cents to dollars for provider charge
  const centsToDollars = (cents: string | number) => {
    if (!cents) return "$0.00";
    const numCents = typeof cents === "string" ? parseInt(cents) : cents;
    return `$${(numCents / 100).toFixed(2)}`;
  };

  // Fetch consumer call history
  const fetchConsumerCallHistory = async () => {
    if (!userId) return;
    
    setIsLoadingConsumer(true);
    try {
      const response = await api.fetch("/api/grpc/users/consumer-call-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ consumerId: userId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch consumer call history");
      }
      
      const data = await response.json();
      setConsumerCallHistory(data.callHistory || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch consumer call history",
      });
    } finally {
      setIsLoadingConsumer(false);
    }
  };

  // Fetch provider call history
  const fetchProviderCallHistory = async () => {
    if (!userId) return;
    
    setIsLoadingProvider(true);
    try {
      const response = await api.fetch("/api/grpc/users/provider-call-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId: userId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch provider call history");
      }
      
      const data = await response.json();
      setProviderCallHistory(data.callHistory || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch provider call history",
      });
    } finally {
      setIsLoadingProvider(false);
    }
  };

  const formatDuration = (seconds: string | number) => {
    if (!seconds) return "0m 0s";
    const numSeconds = typeof seconds === "string" ? parseInt(seconds) : seconds;
    const minutes = Math.floor(numSeconds / 60);
    const remainingSeconds = numSeconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    if (userId) {
      // Load consumer call history
      fetchConsumerCallHistory();
      
      // Load provider call history
      fetchProviderCallHistory();
    }
  }, [userId]);

  return (
    <Tabs defaultValue="consumer" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="consumer">
          Consumer Calls ({consumerCallHistory.length})
        </TabsTrigger>
        <TabsTrigger value="provider">
          Provider Calls ({providerCallHistory.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="consumer">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Consumer Call History</h3>
            <Button 
              onClick={fetchConsumerCallHistory} 
              disabled={isLoadingConsumer}
              variant="outline"
            >
              {isLoadingConsumer ? "Loading..." : "Refresh Call History"}
            </Button>
          </div>

          {sortedConsumerHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Charge (Minutes)</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedConsumerHistory.map((call) => (
                    <TableRow key={call.callId + (call.timestamp?.seconds || '')}>
                      <TableCell>{call.callId}</TableCell>
                      <TableCell>{call.location}</TableCell>
                      <TableCell>{call.context}</TableCell>
                      <TableCell>{formatDuration(call.durationSeconds)}</TableCell>
                      <TableCell>{formatDuration(call.charge)}</TableCell>
                      <TableCell>{formatTimestamp(call.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No consumer call history available
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="provider">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Provider Call History</h3>
            <Button 
              onClick={fetchProviderCallHistory} 
              disabled={isLoadingProvider}
              variant="outline"
            >
              {isLoadingProvider ? "Loading..." : "Refresh Call History"}
            </Button>
          </div>

          {sortedProviderHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Call ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Earnings (Dollars)</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProviderHistory.map((call) => (
                    <TableRow key={call.callId + (call.timestamp?.seconds || '')}>
                      <TableCell>{call.callId}</TableCell>
                      <TableCell>{call.location}</TableCell>
                      <TableCell>{call.context}</TableCell>
                      <TableCell>{formatDuration(call.durationSeconds)}</TableCell>
                      <TableCell>
                        {centsToDollars(call.charge)}
                      </TableCell>
                      <TableCell>{formatTimestamp(call.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No provider call history available
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
