// app/api/grpc/analytics/call-history-page-count/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetTotalCallsPageCountRequest, GetTotalCallsPageCountResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const requestData= await request.json() as GetTotalCallsPageCountRequest;
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const callManagementService = {
      getTotalCallsPageCount: promisify(clients.callManagement.GetTotalCallsPageCount.bind(clients.callManagement))
    };


  

    const response = await callManagementService.getTotalCallsPageCount(
      requestData
    ) as GetTotalCallsPageCountResponse;

    console.log("Total Pages Response:", response);

    return NextResponse.json({
      totalCallCount: response.totalCallCount,
      totalPageCount: response.totalPageCount
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch call page count' }, { status: 500 });
  }
}
