// app/api/grpc/analytics/call-test-analytics/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetCallTestAnalyticsResponse } from '@/types/grpc';
import { dateToProtobufTimestamp } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { date } = await request.json() as { date: string };
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = {
      getCallTestAnalytics: promisify(clients.callManagement.GetCallTestAnalytics.bind(clients.callManagement))
    };

    console.log('date:', date);

    const protoDate = dateToProtobufTimestamp(new Date(date));
    console.log('Proto Date:', protoDate);
    
    // Convert seconds to string to match ProtoTimestamp type
    const protoDateForRequest = {
      seconds: String(protoDate.seconds),
      nanos: protoDate.nanos
    };
    
    const response = await callManagementService.getCallTestAnalytics({date: protoDateForRequest}) as GetCallTestAnalyticsResponse;

    // Transform the response if needed
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call test analytics' }, 
      { status: 500 }
    );
  }
}
