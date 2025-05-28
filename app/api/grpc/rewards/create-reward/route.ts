// app/api/grpc/rewards/create-reward/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { CreateRewardRequest, CreateRewardResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const rewardData: CreateRewardRequest = await request.json();
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const rewardService = {
      CreateReward: promisify(clients.reward.CreateReward.bind(clients.reward))
    };

    const response = await rewardService.CreateReward(rewardData) as CreateRewardResponse;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Create reward error:', error);
    return NextResponse.json(
      { error: 'Failed to create reward', details: error },
      { status: 500 }
    );
  }
}
