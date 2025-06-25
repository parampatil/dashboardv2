// app/api/grpc/deny-list/delete-geohash/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function POST(request: Request) {
    const { geohashes } = await request.json();
    
    try {
      const clients = createServiceClients(getEnvironmentFromRequest(request));
      const denyListService = {
        deleteGeohash: promisify(clients.denyList.DeleteGeohash.bind(clients.denyList))
      };
      
      const response = await denyListService.deleteGeohash({ geohashes });
      return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting geohash:', error);
      return NextResponse.json({ error: `Failed to delete geohash` }, { status: 500 });
    }
  }