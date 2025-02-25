// api/grpc/users/details/route.ts
import { NextResponse } from 'next/server';
import { profileService } from '../../services/profile';
import { balanceService } from '../../services/balance';
import { UserDetailsResponse, ConsumerBalanceResponse, ProviderBalanceResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const [userDetails, consumerBalance, providerBalance] : [UserDetailsResponse, ConsumerBalanceResponse, ProviderBalanceResponse] = await Promise.all([
      profileService.getUserDetails({ userId }) as Promise<UserDetailsResponse>,
      balanceService.getConsumerBalance({ userId }) as Promise<ConsumerBalanceResponse>,
      balanceService.getProviderBalance({ userId }) as Promise<ProviderBalanceResponse>
    ]);

    return NextResponse.json({
      user: userDetails.user,
      consumerPurchaseBalance: consumerBalance.consumerPurchaseBalance,
      providerBalance: {
        providerEarningBalance: providerBalance.providerEarningBalance,
        currency: providerBalance.currency
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}