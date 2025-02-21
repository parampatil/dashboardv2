// app/api/grpc/profile/route.ts
import { NextResponse } from 'next/server';
import { profileService } from '../services/profile';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');

    // Add error handling for the gRPC calls
    try {
      const [pageCountResponse, usersResponse] = await Promise.all([
        profileService.getTotalPageCount({ perPageEntries: pageSize }),
        profileService.getAllUsers({ pageNumber: page, pageSize })
      ]);

      return NextResponse.json({
        users: usersResponse.users,
        totalUsers: pageCountResponse.totalUserCount,
        totalPages: pageCountResponse.totalPageCount
      });
    } catch (error) {
      console.error('gRPC error:', error);
      return NextResponse.json({ error: 'Failed to fetch from gRPC service' }, { status: 500 });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
