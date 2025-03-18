// app/api/grpc/location/active-user-ids/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllActiveUserIdsResponse } from '@/types/grpc';

export async function GET(request: Request) {
  try {
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      getAllActiveUserIds: promisify(clients.location.GetAllActiveUserIds.bind(clients.location))
    };

    // Call the service with empty request
    const response = await locationService.getAllActiveUserIds({}) as GetAllActiveUserIdsResponse;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch location data' }, { status: 500 });
  }
}
