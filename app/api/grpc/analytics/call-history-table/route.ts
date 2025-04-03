// app/api/grpc/analytics/call-history-table/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetCallDetailsRequest, GetCallDetailsResponse } from '@/types/grpc';
import { formatSecondsToHMS, formatTimestampToDate } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const requestData = await request.json() as GetCallDetailsRequest;

    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = {
      getCallDetails: promisify(clients.callManagement.GetCallDetails.bind(clients.callManagement))
    };

    const response = await callManagementService.getCallDetails(requestData) as GetCallDetailsResponse;

    // Transform the data before sending to frontend
    const transformedCallDetails = response.callDetails.map(call => {
      return {
        ...call,
        // Convert timestamps to readable date strings
        createdAt: formatTimestampToDate(call.createdAt),
        sessionStartTimestamp: formatTimestampToDate(call.sessionStartTimestamp),
        sessionEndTimestamp: formatTimestampToDate(call.sessionEndTimestamp),
        providerJoinTimestamp: formatTimestampToDate(call.providerJoinTimestamp),
        providerLeaveTimestamp: formatTimestampToDate(call.providerLeaveTimestamp),
        consumerJoinTimestamp: formatTimestampToDate(call.consumerJoinTimestamp),
        consumerLeaveTimestamp: formatTimestampToDate(call.consumerLeaveTimestamp),
        callUpdatedTimestamp: formatTimestampToDate(call.callUpdatedTimestamp),
        
        // Format durations and charges
        callDuration: formatSecondsToHMS(Number(call.callDuration)),
        charge: formatSecondsToHMS(Number(call.charge)),
        
        // Keep original data for reference if needed
        callDurationSeconds: call.callDuration,
        chargeSeconds: call.charge
      };
    });

    return NextResponse.json({
      callDetails: transformedCallDetails,
      totalRecords: response.totalRecords,
      pageNumber: response.pageNumber,
      pageSize: response.pageSize
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch call details' }, { status: 500 });
  }
}
