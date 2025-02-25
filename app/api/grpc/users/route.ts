// api/grpc/users/route.ts
import { NextResponse } from 'next/server';
import { profileService } from '../services/profile';
import { UsersResponse, PageCountResponse } from '@/types/grpc';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');

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
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}