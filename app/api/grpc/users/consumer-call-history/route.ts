// app/api/grpc/users/consumer-call-history/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetConsumerCallHistoryResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { consumerId } = await request.json();
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const callManagementService = {
      getConsumerCallHistory: promisify(clients.callManagement.GetConsumerCallHistory.bind(clients.callManagement))
    };

    const callHistory = await callManagementService.getConsumerCallHistory({ consumerId }) as GetConsumerCallHistoryResponse;
    
    return NextResponse.json({
      callHistory: callHistory.callHistory
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch consumer call history' }, { status: 500 });
  }
}
