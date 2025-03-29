// app/api/grpc/sales/user-call-analytics/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetUserCallAnalyticsRequest, GetUserCallAnalyticsResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { userId, startTimestamp, endTimestamp } = await request.json() as GetUserCallAnalyticsRequest;
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = {
      getUserCallAnalytics: promisify(clients.callManagement.GetUserCallAnalytics.bind(clients.callManagement))
    };

    const response = await callManagementService.getUserCallAnalytics({ 
      userId, 
      startTimestamp, 
      endTimestamp 
    }) as GetUserCallAnalyticsResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch user call analytics' }, { status: 500 });
  }
}
