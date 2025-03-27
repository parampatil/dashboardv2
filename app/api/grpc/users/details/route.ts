// app/api/grpc/users/details/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { UserDetailsResponse, GetConsumerPurchaseBalanceResponse , GetProviderEarningBalanceResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create services with promisified methods
    const profileService = {
      getUserDetails: promisify(clients.profile.GetUserDetailsByUserId.bind(clients.profile))
    };
    
    const balanceService = {
      getConsumerBalance: promisify(clients.consumerPurchase.GetConsumerPurchaseBalance.bind(clients.consumerPurchase)),
      getProviderBalance: promisify(clients.providerEarning.GetProviderEarningBalance.bind(clients.providerEarning))
    };

    const [userDetails, consumerBalance, providerBalance] : [UserDetailsResponse, GetConsumerPurchaseBalanceResponse, GetProviderEarningBalanceResponse] = await Promise.all([
      profileService.getUserDetails({ userId }) as Promise<UserDetailsResponse>,
      balanceService.getConsumerBalance({ userId }) as Promise<GetConsumerPurchaseBalanceResponse>,
      balanceService.getProviderBalance({ userId }) as Promise<GetProviderEarningBalanceResponse>
    ]);

    return NextResponse.json({
      user: userDetails.user,
      consumerPurchaseBalance: consumerBalance.consumerPurchaseBalance,
      providerBalance: providerBalance
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch user details' }, { status: 500 });
  }
}
