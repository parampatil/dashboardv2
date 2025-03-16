// app/api/grpc/users/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { UsersResponse, PageCountResponse } from '@/types/grpc';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const profileService = {
      getTotalPageCount: promisify(clients.profile.GetTotalPageCount.bind(clients.profile)),
      getAllUsers: promisify(clients.profile.GetAllUsers.bind(clients.profile))
    };

    const [pageCountResponse, usersResponse]: [PageCountResponse, UsersResponse] = await Promise.all([
      profileService.getTotalPageCount({ perPageEntries: pageSize }) as Promise<PageCountResponse>,
      profileService.getAllUsers({ pageNumber: page, pageSize }) as Promise<UsersResponse>
    ]);

    return NextResponse.json({
      users: usersResponse.users,
      totalUsers: pageCountResponse.totalUserCount,
      totalPages: pageCountResponse.totalPageCount
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch users' }, { status: 500 });
  }
}
