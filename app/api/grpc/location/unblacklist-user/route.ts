// app/api/grpc/location/unblacklist-user/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { UnblacklistUserRequest, UnblacklistUserResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json() as UnblacklistUserRequest;
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      unblacklistUser: promisify(clients.location.UnblacklistUser.bind(clients.location))
    };

    // Call the service
    const response = await locationService.unblacklistUser({ userId }) as UnblacklistUserResponse;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to unblacklist user' }, { status: 500 });
  }
}
