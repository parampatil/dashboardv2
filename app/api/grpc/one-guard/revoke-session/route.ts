// app/api/grpc/one-guard/revoke-session/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    
    // Get environment from request headers
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified method
    const oneGuardService = {
      revokeSession: promisify(clients.oneGuard.RevokeSession.bind(clients.oneGuard))
    };

    // Call the service
    const response = await oneGuardService.revokeSession({ user_id });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session', details: error },
      { status: 500 }
    );
  }
}
