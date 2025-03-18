// app/api/grpc/users/provider-call-history/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetProviderCallHistoryResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { providerId } = await request.json();
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const callManagementService = {
      getProviderCallHistory: promisify(clients.callManagement.GetProviderCallHistory.bind(clients.callManagement))
    };

    const callHistory = await callManagementService.getProviderCallHistory({ providerId }) as GetProviderCallHistoryResponse;
    
    return NextResponse.json({
      callHistory: callHistory.callHistory
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch provider call history' }, { status: 500 });
  }
}
