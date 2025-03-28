import { NextResponse } from "next/server";
import {
  createServiceClients,
  getEnvironmentFromRequest,
} from "@/app/api/grpc/client";
import {
  GetIncarceratedUsersRequest,
  GetIncarceratedUsersResponse,
} from "@/types/grpc";
import * as grpc from "@grpc/grpc-js";

export async function GET(request: Request) {
  try {
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    const bearerToken = process.env.MPSQUARE_BEARER_TOKEN;

    if (!bearerToken) {
      throw new Error("Missing bearer token in environment variables");
    }

    // Create metadata with authorization
    const metadata = new grpc.Metadata();
    metadata.add("Authorization", `Bearer ${bearerToken}`);

    const mpSquareService = {
      GetIncarceratedUsers: (requestData: object) =>
        new Promise((resolve, reject) => {
          const method = clients.mpSquare.GetIncarceratedUsers.bind(
            clients.mpSquare
          ) as unknown as (
            request: GetIncarceratedUsersRequest,
            metadata: grpc.Metadata,
            callback: (
              err: grpc.ServiceError | null,
              response: GetIncarceratedUsersResponse
            ) => void
          ) => void;

          method(
            requestData,
            metadata,
            (
              error: grpc.ServiceError | null,
              response: GetIncarceratedUsersResponse
            ) => {
              if (error) {
                reject(error);
              } else {
                resolve(response);
              }
            }
          );
        }),
    };

    // Call the gRPC method
    const response = (await mpSquareService.GetIncarceratedUsers(
      {}
    )) as GetIncarceratedUsersResponse;

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
        message: "Failed to fetch jailed users",
      },
      { status: 500 }
    );
  }
}
