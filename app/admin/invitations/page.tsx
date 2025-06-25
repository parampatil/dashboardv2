// app/admin/invite/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { AutoInviteToggle } from "@/components/admin/AutoInviteToggle";
import CreateInvitationForm from "./CreateInvitationForm";
import InvitationList from "./InvitationList";
import { Invitation } from "@/types/invitation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function InvitePage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [refetchFlag, setRefetchFlag] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "invitations"), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          // Convert Firestore Timestamps to Date objects
          invitedAt: docData.invitedAt,
          updatedAt: docData.updatedAt,
          decidedAt: docData.decidedAt,
          expiry: docData.expiry,
          history: docData.history || []
        } as Invitation;
      });
      setInvitations(data);
      console.log("Invitations updated:", data);
    });
    return () => unsub();
  }, [refetchFlag]);

  const handleInvitationCreated = () => {
    setRefetchFlag(prev => !prev);
  };

  return (
    <ProtectedRoute allowedRoutes={["/admin/invitations"]}>
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Invitations</h1>
        <AutoInviteToggle />
      </div>

      <div className="flex flex-col gap-6">
        <div className="lg:col-span-1">
          <CreateInvitationForm onInvitationCreated={handleInvitationCreated} />
        </div>
        <div className="lg:col-span-2">
          <InvitationList invitations={invitations} />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
