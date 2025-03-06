// app/api/grpc/profile/getUserDetailsByEmail/route.ts

import { NextResponse } from "next/server";
import { profileService } from "../../services/profile";
import { GetUserDetailsByEmailRequest, GetUserDetailsByEmailResponse } from "@/types/grpc";

export async function POST(request: Request) {
    try {
        const { email_prefix } = (await request.json()) as GetUserDetailsByEmailRequest;

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
            { error: "Failed to fetch user details by email" },
            { status: 500 }
        );
    }
}
