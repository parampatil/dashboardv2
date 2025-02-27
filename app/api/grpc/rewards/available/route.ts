// app/api/grpc/rewards/available/route.ts
import { NextResponse } from 'next/server';
import { rewardService } from '../../services/reward';
import { RewardResponse } from '@/types/grpc';

export async function GET() {
  try {
    // @ts-expect-error The rewardService.getAvailableRewards method might not have proper TypeScript definitions.
    const rewardsResponse = await rewardService.getAvailableRewards({}) as RewardResponse;
    
    return NextResponse.json({
      rewards: rewardsResponse.rewards
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch available rewards' }, { status: 500 });
  }
}
