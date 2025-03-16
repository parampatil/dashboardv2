// app/api/grpc/profile/getUserDetailsByEmail/route.ts
import { NextResponse } from "next/server";
import { createServiceClients, getEnvironmentFromRequest } from "@/app/api/grpc/client";
import { promisify } from "util";
import { GetUserDetailsByEmailRequest, GetUserDetailsByEmailResponse } from "@/types/grpc";

export async function POST(request: Request) {
    try {
        const { email_prefix } = (await request.json()) as GetUserDetailsByEmailRequest;
        
        // Get environment from request header
        const environment = getEnvironmentFromRequest(request);
        
        // Create clients for the specified environment
        const clients = createServiceClients(environment);
        
        // Create service with promisified methods
        const profileService = {
            getUserDetailsByEmail: promisify(clients.profile.GetUserDetailsByEmail.bind(clients.profile))
        };

        const userDetails = (await profileService.getUserDetailsByEmail({
            email_prefix,
        })) as GetUserDetailsByEmailResponse;
        
        return NextResponse.json({
            users: userDetails.users,
            total_count: userDetails.total_count,
        });
    }
    catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: error, message: "Failed to fetch user details by email" },
            { status: 500 }
        );
    }
}
