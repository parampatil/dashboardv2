// app/api/grpc/sales/provider-analytics/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllProviderAnalyticsRequest, GetAllProviderAnalyticsResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const { startDate, endDate } = await request.json() as GetAllProviderAnalyticsRequest;
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const providerEarningService = {
      getAllProviderAnalytics: promisify(clients.providerEarning.GetAllProviderAnalytics.bind(clients.providerEarning))
    };

    const response = await providerEarningService.getAllProviderAnalytics({ 
      startDate, 
      endDate 
    }) as GetAllProviderAnalyticsResponse;

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch provider analytics' }, { status: 500 });
  }
}
