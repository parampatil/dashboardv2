// app/api/grpc/users/purchase-history/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { ConsumerPurchaseHistoryResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const consumerPurchaseService = {
      getConsumerPurchaseHistory: promisify(clients.consumerPurchase.GetConsumerPurchaseHistory.bind(clients.consumerPurchase))
    };

    const purchaseHistory = await consumerPurchaseService.getConsumerPurchaseHistory({ userId }) as ConsumerPurchaseHistoryResponse;

    return NextResponse.json({
      consumerPurchaseHistory: purchaseHistory.consumerPurchaseHistory
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch purchase history' }, { status: 500 });
  }
}
