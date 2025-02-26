// app/api/grpc/users/purchase-history/route.ts
import { NextResponse } from 'next/server';
import { balanceService } from '../../services/balance';
import { ConsumerPurchaseHistoryResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const purchaseHistory = await balanceService.getConsumerPurchaseHistory({ userId }) as ConsumerPurchaseHistoryResponse;

    return NextResponse.json({
      consumerPurchaseHistory: purchaseHistory.consumerPurchaseHistory
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase history' }, { status: 500 });
  }
}
