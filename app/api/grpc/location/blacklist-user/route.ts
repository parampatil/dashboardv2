// app/api/grpc/location/blacklist-user/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { BlacklistUserRequest, BlacklistUserResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json() as BlacklistUserRequest;
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      blacklistUser: promisify(clients.location.BlacklistUser.bind(clients.location))
    };

    // Call the service
    const response = await locationService.blacklistUser({ userId }) as BlacklistUserResponse;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to blacklist user' }, { status: 500 });
  }
}
