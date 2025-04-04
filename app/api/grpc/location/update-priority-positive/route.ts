// app/api/grpc/location/update-priority-positive/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { UpdateUserPriorityPositiveRequest, UpdateUserPriorityPositiveResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json() as UpdateUserPriorityPositiveRequest;
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      updateUserPriorityPositive: promisify(clients.location.UpdateUserPriorityPositive.bind(clients.location))
    };

    // Call the service
    const response = await locationService.updateUserPriorityPositive({ userId }) as UpdateUserPriorityPositiveResponse;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to update user priority' }, { status: 500 });
  }
}
