// app/api/grpc/location/blacklisted-users/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllBlacklistedUsersResponse } from '@/types/grpc';

export async function GET(request: Request) {
  try {
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      getAllBlacklistedUsers: promisify(clients.location.GetAllBlacklistedUsers.bind(clients.location))
    };

    // Call the service with empty request
    const response = await locationService.getAllBlacklistedUsers({}) as GetAllBlacklistedUsersResponse;
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch blacklisted users' }, { status: 500 });
  }
}
