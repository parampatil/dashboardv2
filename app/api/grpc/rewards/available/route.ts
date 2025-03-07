// app/api/grpc/rewards/available/route.ts
import { NextResponse } from "next/server";
import { rewardService } from "../../services/RewardService/getAvailableRewards";
import { RewardResponse } from "@/types/grpc";

export async function GET() {
  try {
    const rewardsResponse = (await rewardService.getAvailableRewards(
      // @ts-expect-error The rewardService.getAvailableRewards method might not have proper TypeScript definitions.
      {}
    )) as RewardResponse;

    return NextResponse.json({
      rewards: rewardsResponse.rewards,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error:error, message: "Failed to fetch available rewards" },
      { status: 500 }
    );
  }
}
