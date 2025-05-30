// app/api/grpc/deny-list/get-geohash/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function GET() {
    try {
      const clients = createServiceClients(getEnvironmentFromRequest());
      const denyListService = {
        getGeohash: promisify(clients.denyList.GetGeohash.bind(clients.denyList))
      };
      const response = await denyListService.getGeohash({});
      return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching deny list:', error);
      return NextResponse.json({ error: 'Failed to fetch deny list' }, { status: 500 });
    }
  }