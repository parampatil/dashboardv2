// app/actions/roles.ts
"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function createRole(data: {
  name: string;
  description?: string;
  routes: { [key: string]: string };
}) {
  try {
    await adminDb
      .collection("roles")
      .doc(data.name)
      .set({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    return { success: true };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Failed to create role" };
  }
}

export async function updateRole(name: string, routes: { [key: string]: string }) {
    const batch = adminDb.batch();
    try {
      // 1. Update the role
      const roleRef = adminDb.collection("roles").doc(name);
      batch.update(roleRef, {
        routes,
        updatedAt: new Date().toISOString(),
      });
  
      // 2. Get all users with this role
      const usersSnapshot = await adminDb
        .collection("users")
        .where("roles", "array-contains", name)
        .get();
  
      // 3. Update each user's routes
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userRoles = userData.roles || [];
  
        // Get all roles including the updated one
        const roleSnapshots = await Promise.all(
          userRoles.map(async (r: string) => {
            if (r === name) {
              // Use the new routes for the updated role
              return { exists: true, data: () => ({ routes }) };
            }
            return adminDb.collection("roles").doc(r).get();
          })
        );
  
        // Combine routes from all roles
        const updatedRoutes = roleSnapshots.reduce((acc, roleDoc) => {
          if (roleDoc.exists) {
            const roleData = roleDoc.data();
            return { ...acc, ...roleData.routes };
          }
          return acc;
        }, {});
  
        batch.update(userDoc.ref, {
          allowedRoutes: updatedRoutes,
          updatedAt: new Date().toISOString(),
        });
      }
  
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error("Error updating role:", error);
      return { success: false, error: "Failed to update role" };
    }
  }

export async function deleteRole(name: string) {
  const batch = adminDb.batch();
  try {
    // 1. Get the role before deleting
    const roleRef = adminDb.collection("roles").doc(name);

    // 2. Delete the role
    batch.delete(roleRef);

    // 3. Get all users with this role
    const usersSnapshot = await adminDb
      .collection("users")
      .where("roles", "array-contains", name)
      .get();

    // 4. Update each user's roles and routes
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const updatedRoles = (userData.roles || []).filter(
        (r: string) => r !== name
      );

      // Get all routes from remaining roles
      const remainingRoleSnapshots = await Promise.all(
        updatedRoles.map((r: string) =>
          adminDb.collection("roles").doc(r).get()
        )
      );

      // Combine routes from remaining roles
      const updatedRoutes = remainingRoleSnapshots.reduce((acc, roleDoc) => {
        if (roleDoc.exists) {
          const roleData = roleDoc.data();
          return { ...acc, ...roleData.routes };
        }
        return acc;
      }, {});

      batch.update(userDoc.ref, {
        roles: updatedRoles,
        allowedRoutes: updatedRoutes,
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}
