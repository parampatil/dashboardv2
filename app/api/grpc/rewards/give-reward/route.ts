// app/api/grpc/rewards/give-reward/route.ts
import { NextResponse } from "next/server";
import { createServiceClients, getEnvironmentFromRequest } from "@/app/api/grpc/client";
import { promisify } from "util";
import {
  CreateRewardTransactionRequest,
  CreateRewardTransactionResponse,
} from "@/types/grpc";

export async function POST(request: Request) {
  try {
    const { userId, rewardId } = await request.json() as CreateRewardTransactionRequest;
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const rewardService = {
      createRewardTransaction: promisify(clients.reward.CreateRewardTransactionWithClient.bind(clients.reward))
    };

    const rewardTransaction = await rewardService.createRewardTransaction({
      userId,
      rewardId,
    }) as CreateRewardTransactionResponse;
    
    return NextResponse.json({
      rewardTransactionId: rewardTransaction.rewardTransactionId,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error, message: "Failed to create reward transaction" },
      { status: 500 }
    );
  }
}
