// app/actions/auth.ts
"use server";
import { adminDb } from "@/lib/firebase-admin";
import { assignRoleToUser, addEnvironmentToUser } from "./users";
import { FieldValue } from "firebase-admin/firestore";

export async function createNewUser(userData: {
  uid: string;
  email: string;
  name: string;
  imageUrl?: string;
}) {
  // 1. Check invitation
  const inviteSnap = await adminDb
    .collection("invitations")
    .where("email", "==", userData.email)
    .limit(1)
    .get();
  
  if (inviteSnap.empty) {
    return { success: false, user: null, message: "You are not invited." };
  }

  const invite = inviteSnap.docs[0].data();
  if (invite.status === "rejected") {
    return { success: false, user: null, message: "Your invitation has been rejected." };
  }

  if (invite.status === "requested") {
    return { success: false, user: null, message: "You have requested an invitation. Please wait for approval." };
  }

  if (invite.expiry && new Date() > new Date(invite.expiry.seconds * 1000)) {
    return { success: false, message: "Your invitation has expired." };
  }

  if (invite.status === "joined") {
    return { success: false, user: null, message: "You have already joined the platform. But your account might be deleted" };
  }

  // 2. Create user
  const newUser = {
    ...userData,
    roles: [],
    allowedRoutes: {},
    allowedEnvironments: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await adminDb.collection("users").doc(userData.uid).set(newUser);

  // 3. Assign roles after creation
  if (invite.roles && invite.roles.length > 0) {
    for (const role of invite.roles) {
      await assignRoleToUser(userData.uid, role);
    }
  }

  // 4. Assign environments if any
  if (invite.environments && Object.keys(invite.environments).length > 0) {
    for (const [envKey, envName] of Object.entries(invite.environments)) {
      await addEnvironmentToUser(userData.uid, envKey, envName as string);
    }
  }

  // 5. Mark invitation as joined
await adminDb.collection("invitations").doc(inviteSnap.docs[0].id).update({
    status: "joined",
    joinedAt: new Date(),
    history: FieldValue.arrayUnion({
      timestamp: new Date(),
      action: "User joined the platform",
      performedBy: userData.uid,
    }),
  });

  return { success: true, user: newUser, message: "User created successfully."};
}
