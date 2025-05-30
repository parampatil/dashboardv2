// app/api/grpc/analytics/call-test-analytics/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetCallTestAnalyticsRequest, GetCallTestAnalyticsResponse } from '@/types/grpc';
import { dateToProtoTimestamp, isValidDate } from '@/lib/utils'; // Using standardized utils

export async function POST(request: Request) {
  try {
    const { date: dateString } = await request.json() as { date: string };

    if (!dateString) {
        return NextResponse.json({ message: 'Date is required' }, { status: 400 });
    }

    const parsedDate = new Date(dateString);
    console.log('Parsed date:', parsedDate);
    if (!isValidDate(parsedDate)) {
        return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = clients.callManagement;
    const getCallTestAnalytics = promisify(callManagementService.GetCallTestAnalytics.bind(callManagementService));

    const protoDate = dateToProtoTimestamp(parsedDate);

    if (!protoDate) {
        // This case should ideally not be reached if parsedDate is valid
        return NextResponse.json({ message: 'Failed to convert date to ProtoTimestamp' }, { status: 500 });
    }
    
    const grpcRequest: GetCallTestAnalyticsRequest = { date: protoDate };
    
    const response = await getCallTestAnalytics(grpcRequest) as GetCallTestAnalyticsResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error in call-test-analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch call test analytics';
    // Check for gRPC specific error structure
    const grpcError = error as { code?: number, details?: string };
    if (grpcError.code && grpcError.details) {
        return NextResponse.json({ message: `gRPC Error: ${grpcError.details} (code: ${grpcError.code})` }, { status: 500 });
    }
    return NextResponse.json(
      { message: errorMessage }, 
      { status: 500 }
    );
  }
}
