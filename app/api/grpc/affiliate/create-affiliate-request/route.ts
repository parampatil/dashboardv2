// @/app/api/grpc/affiliate/create-affiliate-request/route.ts
import { NextResponse } from "next/server";
import {
  createServiceClients,
  getEnvironmentFromRequest,
} from "@/app/api/grpc/client";
import { promisify } from "util";
import {
  RequestAffiliateConvertResponse,
} from "@/types/grpc";

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);

    const authService = {
      RequestAffiliateConvertRequest: promisify(
        clients.auth.RequestAffiliateConvertRequest.bind(clients.auth)
      ),
    };

    console.log("Creating affiliate request for user ID:", parseInt(userId));

    const response = (await authService.RequestAffiliateConvertRequest({
      user_id: parseInt(userId),
    })) as RequestAffiliateConvertResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error("API error in create-affiliate-request:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create affiliate request";
    // Check for gRPC specific error structure
    const grpcError = error as { code?: number; details?: string };
    if (grpcError.code && grpcError.details) {
      return NextResponse.json(
        {
          message: `gRPC Error: ${grpcError.details} (code: ${grpcError.code})`,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
