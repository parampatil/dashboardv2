// app/api/grpc/analytics/call-history-table/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetCallDetailsRequest, GetCallDetailsResponse, GetAllUserIdsAndNamesDashboardResponse } from '@/types/grpc';
import { formatSecondsToHMS, formatTimestampToDate } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const requestData = await request.json() as GetCallDetailsRequest;

    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = {
      getCallDetails: promisify(clients.callManagement.GetCallDetails.bind(clients.callManagement))
    };
    
    const profileService = {
      getAllUserIdsAndNamesDashboard: promisify(clients.profile.GetAllUserIdsAndNamesDashboard.bind(clients.profile))
    };

    // Fetch call details and user names in parallel
    const [callDetailsResponse, userNamesResponse] = await Promise.all([
      callManagementService.getCallDetails(requestData) as Promise<GetCallDetailsResponse>,
      profileService.getAllUserIdsAndNamesDashboard({}) as Promise<GetAllUserIdsAndNamesDashboardResponse>
    ]);

    // Create a mapping of user IDs to names
    const userIdToNameMap = userNamesResponse.userIdsAndNames || {};

    // Transform the data before sending to frontend
    const transformedCallDetails = callDetailsResponse.callDetails.map(call => {
      return {
        ...call,
        // Add user names from the mapping
        consumerName: userIdToNameMap[call.consumerId] || 'Unknown User',
        providerName: userIdToNameMap[call.providerId] || 'Unknown User',
        
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
      totalRecords: callDetailsResponse.totalRecords,
      pageNumber: callDetailsResponse.pageNumber,
      pageSize: callDetailsResponse.pageSize
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch call details' }, { status: 500 });
  }
}
