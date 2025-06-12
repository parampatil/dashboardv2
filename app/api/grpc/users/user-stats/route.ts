// api/grpc/users/user-stats/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';

export async function GET(request: Request) {
    try {
        // Get environment from request header
        const environment = getEnvironmentFromRequest(request);

        // Create clients for the specified environment
        const clients = createServiceClients(environment);

        // Create service with promisified methods
        const userStatsService = {
            getAllUserStats: promisify(clients.profile.GetAllUserStats.bind(clients.profile)),
        };

        const userStatsResponse = await userStatsService.getAllUserStats({});

        return NextResponse.json({
            stats: userStatsResponse,
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error, message: 'Failed to fetch user stats' },
            { status: 500 }
        );
    }
}