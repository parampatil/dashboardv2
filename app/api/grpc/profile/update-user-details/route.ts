// app/api/grpc/profile/update-user-details/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { UpdateUserDetailsRequest, UpdateUserDetailsResponse } from '@/types/grpc';

export async function POST(request: Request) {
  try {
    const updateData: UpdateUserDetailsRequest = await request.json();
    
    const environment = getEnvironmentFromRequest(request);
    const clients = createServiceClients(environment);
    
    const profileService = {
      updateUserDetails: promisify(clients.profile.UpdateUserDetails.bind(clients.profile))
    };

    const response = await profileService.updateUserDetails(updateData) as UpdateUserDetailsResponse;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update user details', success: false },
      { status: 500 }
    );
  }
}
