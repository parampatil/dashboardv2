// app/api/grpc/users/earning-transactions/route.ts
import { NextResponse } from 'next/server';
import { balanceService } from '../../services/balance';
import { ProviderEarningTransactionsResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const earningTransactions = await balanceService.getProviderEarningTransactions({ userId }) as ProviderEarningTransactionsResponse;
    return NextResponse.json({
      providerEarningTransactions: earningTransactions.providerTransactionHistory
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch earning transactions' }, { status: 500 });
  }
}
