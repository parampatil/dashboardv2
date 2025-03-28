// app/api/grpc/mp2/jailbreak-user/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { JailbreakUserRequest, JailbreakUserResponse } from '@/types/grpc';
import * as grpc from "@grpc/grpc-js";

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    const bearerToken = process.env.MPSQUARE_BEARER_TOKEN;

    if (!bearerToken) {
      throw new Error("Missing bearer token in environment variables");
    }

    // Create metadata with authorization
    const metadata = new grpc.Metadata();
    metadata.add('Authorization', `Bearer ${bearerToken}`);
    
    const mpSquareService = {
      JailbreakUser: (requestData: JailbreakUserRequest) =>
        new Promise((resolve, reject) => {
          const method = clients.mpSquare.JailbreakUser.bind(
            clients.mpSquare
          ) as unknown as (
            request: JailbreakUserRequest,
            metadata: grpc.Metadata,
            callback: (
              err: grpc.ServiceError | null,
              response: JailbreakUserResponse
            ) => void
          ) => void;

          method(
            requestData,
            metadata,
            (
              error: grpc.ServiceError | null,
              response: JailbreakUserResponse
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
    const response = await mpSquareService.JailbreakUser({ user_id: Number(user_id) }) as JailbreakUserResponse;
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: (error as Error).message, 
        message: 'Failed to jailbreak user' 
      }, 
      { status: 500 }
    );
  }
}
