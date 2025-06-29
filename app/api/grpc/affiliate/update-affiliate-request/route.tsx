// @/app/api/grpc/affiliate/update-affiliate-request/route.ts
import { NextResponse } from "next/server";
import {
  createServiceClients,
  getEnvironmentFromRequest,
} from "@/app/api/grpc/client";
import { promisify } from "util";
import {
    AffiliateUpdateRequest,
  UpdateAffiliateRequestResponse,
} from "@/types/grpc";

export async function POST(request: Request) {
  try {
    const { request_id, status, approver_user_id } = (await request.json()) as AffiliateUpdateRequest;

    if (!request_id || !status || !approver_user_id) {
       const errorMessage = `${request_id ? "" : "Request ID is required. "}${status ? "" : "Status is required. "}${approver_user_id ? "" : "Approver User ID is required."}`;
      return NextResponse.json(
        { message: errorMessage },
        { status: 400 }
      );
    }

    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);

    const authService = {
      UpdateAffiliateRequest: promisify(
        clients.auth.UpdateAffiliateRequest.bind(clients.auth)
      ),
    };

    const response = (await authService.UpdateAffiliateRequest({
      request_id: request_id,
      status,
      approver_user_id: approver_user_id,
    })) as UpdateAffiliateRequestResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error("API error in update-affiliate-request:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update affiliate request";
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
