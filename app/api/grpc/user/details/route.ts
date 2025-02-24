// app/api/user/details/route.ts
import { NextResponse } from 'next/server';
import { userService } from '../../services/user';
import {balanceService} from '../../services/balance';


export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log('Fetching user details for user ID:', userId);

    // Make parallel requests to all three services
    const [userDetails, consumerBalance, providerBalance] = await Promise.all([
      userService.getUserDetails({ userId }),
      balanceService.getConsumerBalance({ userId }),
      balanceService.getProviderBalance({ userId })
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
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' }, 
      { status: 500 }
    );
  }
}
