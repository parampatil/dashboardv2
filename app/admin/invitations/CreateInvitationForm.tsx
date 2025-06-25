// app/admin/invite/CreateInvitationForm.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "@/components/admin/RoleSelector";
import EnvironmentSelector from "@/components/admin/EnvironmentAccessSelector";
import { createInvitation } from "@/app/actions/invitations";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { useAuth } from "@/context/AuthContext";
import { environmentsList } from "@/config/environments";
import { Role } from "@/types";

export default function CreateInvitationForm({
  onInvitationCreated,
}: {
  onInvitationCreated: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [expiry, setExpiry] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Add 2 days to current date
    return date;
  }); // Default to 2 days from now
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedEnvs, setSelectedEnvs] = useState<{ [key: string]: string }>(
    {}
  );
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available roles from Firestore
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesCollection = collection(db, "roles");
        const snapshot = await getDocs(rolesCollection);
        const rolesData = snapshot.docs.map(
          (doc) =>
            ({
              name: doc.id,
              ...doc.data(),
            } as Role)
        );
        setAvailableRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    console.log("Available roles fetched:", availableRoles);
  }, [availableRoles]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check for existing invitation
      const q = query(
        collection(db, "invitations"),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        throw new Error("An invitation already exists for this email");
      }

      const response = await createInvitation({
        email,
        expiry: expiry,
        roles: selectedRoles,
        environments: selectedEnvs,
        status: "invited",
        invitedBy: user?.uid || "admin",
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create invitation");
      }

      // Show success toast
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email} successfully.`,
      });

      // Reset form
      setEmail("");
      setExpiry(() => {
        const date = new Date()
        date.setDate(date.getDate() + 2); // Reset to 2 days from now
        return date;
      });
      setSelectedRoles([]);
      setSelectedEnvs({});
      onInvitationCreated();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnvironment = (env: string) => {
    if (
      !selectedEnvs[env] &&
      Object.keys(environmentsList).includes(env)
    ) {
      setSelectedEnvs((prev) => ({ ...prev, [env]: environmentsList[env as keyof typeof environmentsList] }));
    }
  };

  const handleRemoveEnvironment = (env: string) => {
    const newEnvs = { ...selectedEnvs };
    delete newEnvs[env];
    setSelectedEnvs(newEnvs);
  };

  const handleAddRole = (role: string) => {
    if (
      !selectedRoles.includes(role) &&
      availableRoles.some((r) => r.name === role)
    ) {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleRemoveRole = (role: string) => {
    setSelectedRoles(selectedRoles.filter((r) => r !== role));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <h2 className="text-xl font-semibold mb-4">Create New Invitation</h2>
      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            type="email"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Roles</label>
            <RoleSelector
              availableRoles={availableRoles}
              selectedRoles={selectedRoles}
              onAddRole={handleAddRole}
              onRemoveRole={handleRemoveRole}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Environments
            </label>
            <EnvironmentSelector
              allowedEnvironments={selectedEnvs}
              onAddEnvironment={handleAddEnvironment}
              onRemoveEnvironment={handleRemoveEnvironment}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Expiry (optional)
          </label>
          <Input
            type="date"
            value={expiry.toISOString().split("T")[0]}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setExpiry(date);
            }}
            className="w-full"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Create Invitation"}
        </Button>
      </form>
    </motion.div>
  );
}
