// app/api/grpc/rewards/available/route.ts
import { NextResponse } from "next/server";
import { createServiceClients, getEnvironmentFromRequest } from "../../client";
import { promisify } from "util";
import { RewardResponse } from "@/types/grpc";

export async function GET(request: Request) {
  try {
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const rewardService = {
      getAvailableRewards: promisify(clients.reward.GetAvailableRewards.bind(clients.reward))
    };

    const rewardsResponse = (await rewardService.getAvailableRewards({})) as RewardResponse;

    return NextResponse.json({
      rewards: rewardsResponse.rewards,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error, message: "Failed to fetch available rewards" },
      { status: 500 }
    );
  }
}
