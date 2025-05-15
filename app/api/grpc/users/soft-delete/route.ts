// app/api/grpc/users/soft-delete/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const authService = {
      softDeleteUser: promisify(clients.auth.SoftDeleteUser.bind(clients.auth))
    };

    // Match proto field name (user_id) while keeping JS camelCase variable
    const response = await authService.softDeleteUser({ user_id: userId });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Soft delete error:', error);
    return NextResponse.json(
      { error: 'Failed to soft delete user' },
      { status: 500 }
    );
  }
}
