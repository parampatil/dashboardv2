import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function POST(request: Request) {
  const { user_id } = await request.json();
  
  try {
    const clients = createServiceClients(getEnvironmentFromRequest());
    const oneGuardService = {
      revokeSession: promisify(clients.oneGuard.RevokeSession.bind(clients.oneGuard))
    };

    const response = await oneGuardService.revokeSession({ user_id });
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
