// app/api/grpc/users/earning-transactions/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { ProviderEarningTransactionsResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const providerEarningService = {
      getProviderEarningTransactions: promisify(clients.providerEarning.GetProviderEarningTransactions.bind(clients.providerEarning))
    };

    const earningTransactions = await providerEarningService.getProviderEarningTransactions({ userId }) as ProviderEarningTransactionsResponse;
    
    return NextResponse.json({
      providerEarningTransactions: earningTransactions.providerTransactionHistory
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch earning transactions' }, { status: 500 });
  }
}
