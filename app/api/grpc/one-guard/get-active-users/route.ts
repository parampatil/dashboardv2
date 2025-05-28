// app/api/grpc/one-guard/get-active-users/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function GET(request: Request) {
  try {
    // Get environment from request headers
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const oneGuardService = {
      getActiveUsers: promisify(clients.oneGuard.GetActiveUsers.bind(clients.oneGuard))
    };

    // Call the service
    const response = await oneGuardService.getActiveUsers({});
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch active users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active users', details: error },
      { status: 500 }
    );
  }
}
