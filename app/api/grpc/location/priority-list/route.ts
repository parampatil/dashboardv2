// app/api/grpc/location/priority-list/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllPriorityListResponse } from '@/types/grpc';
import { convertInt64BinaryToBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      getAllPriorityList: promisify(clients.location.GetAllPriorityList.bind(clients.location))
    };

    // Call the service with empty request
    const response = await locationService.getAllPriorityList({}) as GetAllPriorityListResponse;
    
    // Transform the data - convert both userId and priority to numbers
    if (response.priorityList) {
      const transformedPriorityList: Record<string, string> = {};
      
      Object.entries(response.priorityList).forEach(([binaryUserId, priority]) => {
        // Use your existing convertInt64BinaryToBigInt function to convert userId
        const userId = convertInt64BinaryToBigInt(binaryUserId) as string;
        transformedPriorityList[userId] = priority;
      });
      
      response.priorityList = transformedPriorityList;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch priority list' }, { status: 500 });
  }
}