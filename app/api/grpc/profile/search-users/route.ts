// app/api/grpc/profile/search-users/route.ts
import { NextResponse } from "next/server";
import { createServiceClients, getEnvironmentFromRequest } from "@/app/api/grpc/client";
import { promisify } from "util";

export async function GET(request: Request) {
  try {
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);

    const profileService = {
      getAllUserIdsAndNamesDashboard: promisify(
        clients.profile.GetAllUserIdsAndNamesDashboard.bind(clients.profile)
      ),
    };

    // Directly return the backend response, no transformation
    const response = await profileService.getAllUserIdsAndNamesDashboard({});
    return NextResponse.json(response);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
