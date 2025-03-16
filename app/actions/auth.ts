// app/actions/auth.ts
"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function createNewUser(userData: {
  uid: string;
  email: string;
  name: string;
  imageUrl?: string;
}) {
  try {
    const newUser = {
      ...userData,
      roles: [], // New users start with no roles
      allowedRoutes: {
        '/profile': 'Profile' // Default route access
      },
      allowedEnvironments: {
        'dev': 'Development' // Default environment access
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection("users").doc(userData.uid).set(newUser);
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}
