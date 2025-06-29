// app/api/affiliate/all-affiliate-requests/route.ts
import { NextResponse } from "next/server";
import { createServiceClients, getEnvironmentFromRequest } from "@/app/api/grpc/client";
import { promisify } from "util";

import { GetAllAffiliateResponse, AffiliateRequest } from "@/types/grpc";

export async function GET(request: Request) {
  try {
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);

    const authService = {
      GetAllAffiliateRequests: promisify(
        clients.auth.GetAllAffiliateRequest.bind(clients.auth)
      ),
    };

    const response = (await authService.GetAllAffiliateRequests(
        {}
    )) as GetAllAffiliateResponse;

    return NextResponse.json(response.requests as AffiliateRequest[]);
  } catch (error) {
    console.error("API error in all-affiliate-requests:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch affiliate requests";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}