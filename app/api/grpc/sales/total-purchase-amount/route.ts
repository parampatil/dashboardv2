// app/api/grpc/sales/total-purchase-amount/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetTotalConsumerPurchaseAmountRequest, GetTotalConsumerPurchaseAmountResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { startDate, endDate } = await request.json() as GetTotalConsumerPurchaseAmountRequest;
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const consumerPurchaseService = {
      getTotalConsumerPurchaseAmount: promisify(clients.consumerPurchase.GetTotalConsumerPurchaseAmount.bind(clients.consumerPurchase))
    };

    const response = await consumerPurchaseService.getTotalConsumerPurchaseAmount({ 
      startDate, 
      endDate 
    }) as GetTotalConsumerPurchaseAmountResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch total purchase amount' }, { status: 500 });
  }
}
