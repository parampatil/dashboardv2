// app/api/grpc/analytics/call-history-analytics/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllUsersCallTimeRequest, GetAllUsersCallTimeResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { startTime, endTime } = await request.json() as GetAllUsersCallTimeRequest;
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = {
      getAllUsersCallTime: promisify(clients.callManagement.GetAllUsersCallTime.bind(clients.callManagement))
    };

    const response = await callManagementService.getAllUsersCallTime({ startTime, endTime }) as GetAllUsersCallTimeResponse;
    console.log('API response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch call history analytics' }, { status: 500 });
  }
}
