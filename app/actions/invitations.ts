// app/actions/invitations.ts
"use server";
import { adminDb } from "@/lib/firebase-admin";
import { HistoryEntry, Invitation } from "@/types/invitation";

export async function createInvitation(data: {
  email: string;
  roles?: string[];
  environments?: { [key: string]: string };
  invitedBy?: string;
  expiry?: Date;
  status?: "invited" | "requested";
  requestMessage?: string;
}) {
  try {
    const inviteSnap = await adminDb
      .collection("invitations")
      .where("email", "==", data.email)
      .limit(1)
      .get();

    if (!inviteSnap.empty) {
      const invite = inviteSnap.docs[0].data() as Invitation;
      switch (invite.status) {
        case "invited":
          return {
            success: false,
            message: "You already have an active invitation.",
          };
        case "joined":
          return {
            success: false,
            message: "You have already joined the platform. But your account might be deleted",
          };
        case "requested":
          return {
            success: false,
            message: "Your request is pending approval.",
          };
        case "rejected":
          return {
            success: false,
            message: "Your previous request was rejected.",
          };
        case "expired":
          return {
            success: false,
            message: "Your previous invitation has expired.",
          };
        case "deleted":
          return {
            success: false,
            message: "Your account was deleted.",
          };
        default:
          return {
            success: false,
            message: "An invitation already exists for this email.",
          };
      }
    }

    // Set expiry: 3 days for invited, none for requested
    let expiryDate: Date | null = null;
    if (data.status === "invited") {
      expiryDate =
        data.expiry || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }

    const historyEntry: HistoryEntry = {
      timestamp: new Date(),
      action:
        data.status === "requested"
          ? "User requested access"
          : `Invitation created by ${data.invitedBy || "admin"}`,
      performedBy: data.invitedBy || "system",
    };

    // Create a base invitation object with required fields
    const invitationData: Partial<Omit<Invitation, "id">> = {
      email: data.email,
      status: data.status || "invited",
      invitedAt: new Date(),
      history: [historyEntry],
      updatedAt: new Date(),
      roles: data.roles || [],
      environments: data.environments || {},
    };

    // Only add optional fields if they have values (not undefined)
    if (expiryDate !== null) {
      invitationData.expiry = expiryDate;
    }

    if (data.invitedBy) {
      invitationData.invitedBy = data.invitedBy;
    }

    if (data.requestMessage) {
      invitationData.requestMessage = data.requestMessage;
    }

    const docRef = await adminDb.collection("invitations").add(invitationData);
    await docRef.update({ id: docRef.id });
    return { success: true, message: "Invitation created successfully." };
  } catch (err: unknown) {
    console.error("Error creating invitation:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "An error occurred.",
    };
  }
}

export async function updateInvitation(
  id: string,
  updates: Partial<Invitation> & { historyEntry?: HistoryEntry }
) {
  try {
    const docRef = adminDb.collection("invitations").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, message: "Invitation not found" };
    }

    const existingData = doc.data() as Invitation;

    // Create a clean update object with no undefined values
    const cleanUpdates: Record<string, unknown> = {};

    // Copy only defined values from updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    // Always add updatedAt
    cleanUpdates.updatedAt = new Date();

    // Handle history update
    if (updates.historyEntry) {
      cleanUpdates.history = [
        ...(existingData.history || []),
        updates.historyEntry,
      ];
    }

    await docRef.update(cleanUpdates);
    return { success: true, message: "Invitation updated successfully." };
  } catch (err: unknown) {
    console.error("Error updating invitation:", err);
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to update invitation.",
    };
  }
}

export async function deleteInvitation(id: string) {
  try {
    await adminDb.collection("invitations").doc(id).delete();
    return { success: true, message: "Invitation deleted successfully." };
  } catch (err: unknown) {
    return {
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to delete invitation",
    };
  }
}
