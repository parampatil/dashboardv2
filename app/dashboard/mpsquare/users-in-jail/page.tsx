// app/dashboard/mp2/users-in-jail/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { IncarceratedUser } from "@/types/grpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import { formatJailTime } from "@/lib/utils";

export default function UsersInJail() {
  const [incarceratedUsers, setIncarceratedUsers] = useState<IncarceratedUser[]>([]);
  const [loading, setLoading] = useState(true);
  // const [selectedUser, setSelectedUser] = useState<IncarceratedUser | null>(null);
  // const [newJailTime, setNewJailTime] = useState("");
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    fetchIncarceratedUsers();
  }, []);

  const fetchIncarceratedUsers = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const response = await api.fetch("/api/grpc/mp2/get-jailed-users");
      const data = await response.json();
      // Check if the API response is successful
      if (!response.ok || !data || !data.users) {
        throw new Error(`API error: ${data?.error || response.statusText || 'Unknown error'}`);
      }

      // Log successful data retrieval
      console.log("Successfully retrieved incarcerated users:", data.users.length);
      setIncarceratedUsers(data.users);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch incarcerated users",
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // const handleChangeJailTime = (user: IncarceratedUser) => {
  //   setSelectedUser(user);
  //   setNewJailTime("");
  //   setIsDialogOpen(true);
  // };

  // const handleSetJailTime = async () => {
  //   if (!selectedUser || !newJailTime) return;
  //   try {
  //     const response = await api.fetch("/api/grpc/mp2/set-jail-time", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         userId: selectedUser.user_id,
  //         jailTimeSeconds: parseInt(newJailTime) * 60,
  //       }),
  //     });
  //     const data = await response.json();
  //     toast({
  //       title: "Jail time updated",
  //       description: data.message || `Jail time for ${selectedUser.first_name} ${selectedUser.last_name} has been updated.`,
  //     });
  //     setIsDialogOpen(false);
  //     fetchIncarceratedUsers();
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Failed to update jail time",
  //       description: (error as Error).message,
  //     });
  //   }
  // };

  const handleJailbreak = async (user_id: number) => {
    try {
      const response = await api.fetch("/api/grpc/mp2/jailbreak-user", {
        method: "POST",
        body: JSON.stringify({ user_id }),
      });
      const data = await response.json();
      toast({
        title: "User released",
        description: data.message || "The user has been released from jail.",
      });
      fetchIncarceratedUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to release user",
        description: (error as Error).message,
      });
    }
  };

  

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/mpsquare/users-in-jail"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Users in Jail</h1>
            <Button
              variant="outline"
              onClick={fetchIncarceratedUsers}
              disabled={loading || refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Jail Time End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incarceratedUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.email_address}</TableCell>
                    <TableCell>{formatJailTime(user.jail_time_end)}</TableCell>
                    <TableCell>
                      {/* <Button onClick={() => handleChangeJailTime(user)} className="mr-2">
                        Change Jail Time
                      </Button> */}
                      <Button onClick={() => handleJailbreak(user.user_id)} variant="destructive">
                        Release
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Jail Time</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            placeholder="New jail time in minutes"
            value={newJailTime}
            onChange={(e) => setNewJailTime(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSetJailTime}>Set Jail Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </ProtectedRoute>
  );
}
