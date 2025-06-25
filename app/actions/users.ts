// app/actions/users.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface UserData {
  allowedRoutes: { [key: string]: string };
  roles: string[];
  allowedEnvironments: { [key: string]: string };
  email?: string;
}

interface RoleData {
  routes: { [key: string]: string };
}

export async function assignRoleToUser(userId: string, roleName: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const roleRef = adminDb.collection("roles").doc(roleName);

    const [userDoc, roleDoc] = await Promise.all([
      userRef.get(),
      roleRef.get(),
    ]);

    if (!userDoc.exists || !roleDoc.exists) {
      throw new Error("User or role not found");
    }

    const userData = userDoc.data() as UserData;
    const roleData = roleDoc.data() as RoleData;

    if (!userData || !roleData) {
      throw new Error("Invalid data structure");
    }

    const updatedRoutes = {
      ...userData.allowedRoutes,
      ...roleData.routes,
    };

    await userRef.update({
      roles: [...(userData.roles || []), roleName],
      allowedRoutes: updatedRoutes,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error assigning role:", error);
    return { success: false, error: "Failed to assign role" };
  }
}

export async function removeRoleFromUser(userId: string, roleName: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const roleRef = adminDb.collection("roles").doc(roleName);

    const [userDoc, roleDoc] = await Promise.all([
      userRef.get(),
      roleRef.get(),
    ]);

    if (!userDoc.exists || !roleDoc.exists) {
      throw new Error("User or role not found");
    }

    const userData = userDoc.data() as UserData;
    const roleData = roleDoc.data() as RoleData;

    if (!userData || !roleData) {
      throw new Error("Invalid data structure");
    }

    // Remove role from user's roles array
    const updatedRoles = userData.roles.filter((r) => r !== roleName);

    // Recalculate allowed routes based on remaining roles
    const remainingRoles = await Promise.all(
      updatedRoles.map((r) => adminDb.collection("roles").doc(r).get())
    );

    const updatedRoutes = remainingRoles.reduce((acc, role) => {
      if (role.exists) {
        const roleData = role.data() as RoleData;
        return { ...acc, ...roleData.routes };
      }
      return acc;
    }, {} as { [key: string]: string });

    await userRef.update({
      roles: updatedRoles,
      allowedRoutes: updatedRoutes,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing role:", error);
    return { success: false, error: "Failed to remove role" };
  }
}

export async function addEnvironmentToUser(
  userId: string,
  envKey: string,
  envName: string
) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data() as UserData;
    const currentEnvironments = userData.allowedEnvironments || {};

    // Add the new environment
    const updatedEnvironments = {
      ...currentEnvironments,
      [envKey]: envName,
    };

    await userRef.update({
      allowedEnvironments: updatedEnvironments,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding environment to user:", error);
    return { success: false, error: "Failed to add environment" };
  }
}

export async function removeEnvironmentFromUser(
  userId: string,
  envKey: string
) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data() as UserData;
    const currentEnvironments = userData.allowedEnvironments || {};

    // Create a new object without the environment to remove
    const updatedEnvironments = { ...currentEnvironments };
    delete updatedEnvironments[envKey];

    await userRef.update({
      allowedEnvironments: updatedEnvironments,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing environment from user:", error);
    return { success: false, error: "Failed to remove environment" };
  }
}

export async function deleteUser(userId: string, deletedBy: string) {
  try {
    // Fetch user data to check for associated email
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    const userData = userDoc.data() as UserData;
    if (!userData || !userData.email) {
      throw new Error("User data is incomplete or email is missing");
    }

    // Try both operations and collect any errors
    const authError = await adminAuth.deleteUser(userId).catch((err) => err);
    const dbError = await adminDb
      .collection("users")
      .doc(userId)
      .delete()
      .catch((err) => err);

    // Check if either operation failed
    if (authError instanceof Error || dbError instanceof Error) {
      console.error("Auth delete error:", authError);
      console.error("Database delete error:", dbError);

      // Determine which operations succeeded/failed for the error message
      const failedOps = [];
      if (authError instanceof Error) failedOps.push("auth account");
      if (dbError instanceof Error) failedOps.push("database record");

      if (failedOps.length === 2) {
        throw new Error("Failed to delete user");
      } else {
        console.warn(
          `Partial success: deleted user ${
            failedOps.length === 1 ? "except " + failedOps[0] : ""
          }`
        );
      }
    }
    // If both operations succeeded, return success
    console.log("User deleted successfully from both auth and database");

    // set the invitation status to "deleted"
    const inviteSnap = await adminDb
      .collection("invitations")
      .where("email", "==", userData.email)
      .limit(1)
      .get();

    if (!inviteSnap.empty) {
      const inviteDoc = inviteSnap.docs[0];
      await inviteDoc.ref.update({
        status: "deleted",
        updatedAt: new Date(),
        history: FieldValue.arrayUnion({
          timestamp: new Date(),
          action: "User account deleted",
          details: `User with ID ${userId} and email ${userData.email} has been deleted. This action was performed by ${deletedBy}.`,
        }),

      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
