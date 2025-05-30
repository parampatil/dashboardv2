// app/api/grpc/analytics/call-metrics-summary/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import {
  GetCallMetricsRequest,
  GetCallMetricsResponse,
  GetCallDurationMetricsRequest,
  GetCallDurationMetricsResponse,
  ProtoTimestamp
} from '@/types/grpc';

// Helper to convert Date to ProtoTimestamp
const dateToProtoTimestamp = (date: Date): ProtoTimestamp => {
  if (!date) {
    // Handle cases where date might be undefined, though the UI should prevent this
    const now = new Date();
    return {
      seconds: Math.floor(now.getTime() / 1000).toString(),
      nanos: (now.getTime() % 1000) * 1000000,
    };
  }
  return {
    seconds: Math.floor(date.getTime() / 1000).toString(),
    nanos: (date.getTime() % 1000) * 1000000,
  };
};


export async function POST(request: Request) {
  try {
    const { startDate, endDate } = await request.json() as { startDate: string, endDate: string };

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'startDate and endDate are required' }, { status: 400 });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return NextResponse.json({ message: 'Invalid date format for startDate or endDate' }, { status: 400 });
    }

    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);

    const callManagementService = clients.callManagement;

    const getCallMetrics = promisify(callManagementService.GetCallMetrics.bind(callManagementService));
    const getCallDurationMetrics = promisify(callManagementService.GetCallDurationMetrics.bind(callManagementService));

    const protoStartDate = dateToProtoTimestamp(parsedStartDate);
    const protoEndDate = dateToProtoTimestamp(parsedEndDate);

    const callMetricsRequest: GetCallMetricsRequest = { startDate: protoStartDate, endDate: protoEndDate };
    const callDurationMetricsRequest: GetCallDurationMetricsRequest = { startDate: protoStartDate, endDate: protoEndDate };

    // Perform calls in parallel
    const [callMetricsResponse, callDurationMetricsResponse] = await Promise.all([
      getCallMetrics(callMetricsRequest) as Promise<GetCallMetricsResponse>,
      getCallDurationMetrics(callDurationMetricsRequest) as Promise<GetCallDurationMetricsResponse>
    ]);

    return NextResponse.json({
      callMetrics: callMetricsResponse,
      callDurationMetrics: callDurationMetricsResponse,
    });

  } catch (error) {
    console.error('API error in call-metrics-summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch call summary metrics';
    // Check if the error is a gRPC error object
    // gRPC errors often have a 'code' and 'details' property
    const grpcError = error as { code?: number, details?: string, metadata?: Record<string, unknown> };
    if (grpcError.code && grpcError.details) {
        return NextResponse.json({ message: `gRPC Error: ${grpcError.details} (code: ${grpcError.code})` }, { status: 500 });
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
