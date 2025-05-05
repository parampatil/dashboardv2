import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function GET() {
  try {
    const clients = createServiceClients(getEnvironmentFromRequest());
    const oneGuardService = {
      getActiveUsers: promisify(clients.oneGuard.GetActiveUsers.bind(clients.oneGuard))
    };

    const response = await oneGuardService.getActiveUsers({});
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch active users' },
      { status: 500 }
    );
  }
}
