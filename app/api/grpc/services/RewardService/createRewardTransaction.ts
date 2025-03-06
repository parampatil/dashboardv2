// app/api/grpc/services/reward.ts
import { clients } from "../../client";
import { promisify } from "util";
import type { RewardServiceClient } from "@/types/grpc";

const rewardsClient = clients.reward as unknown as RewardServiceClient;

export const rewardService = {
  createRewardTransaction: promisify(
    rewardsClient.CreateRewardTransaction.bind(rewardsClient)
  ),
};
