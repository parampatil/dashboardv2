// app/api/grpc/rewards/CreateRewardTransactionRequestWithClient/route.ts

import { NextResponse } from "next/server";
import { rewardService } from "../../services/RewardService/createRewardTransaction";
import {
  CreateRewardTransactionRequest,
  CreateRewardTransactionResponse,
} from "@/types/grpc";

export async function POST(request: Request) {
  try {
    const { userId, rewardId } =
      (await request.json()) as CreateRewardTransactionRequest;

    const rewardTransaction = (await rewardService.CreateRewardTransactionWithClient({
      userId,
      rewardId,
    })) as CreateRewardTransactionResponse;
    return NextResponse.json({
      rewardTransactionId: rewardTransaction.rewardTransactionId,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create reward transaction" },
      { status: 500 }
    );
  }
}
