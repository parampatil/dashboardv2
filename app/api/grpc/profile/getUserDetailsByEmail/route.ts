// // app/api/grpc/profile/getUserDetailsByEmail/route.ts

// import { NextResponse } from "next/server";
// import { profileService } from "../../services/ProfileService/getUserDetailsByEmail";
// import { GetUserDetailsByEmailRequest, GetUserDetailsByEmailResponse } from "@/types/grpc";

// export async function POST(request: Request) {
//     try {
//         const { email } = (await request.json()) as GetUserDetailsByEmailRequest;

//         const userDetails = (await profileService.getUserDetailsByEmail({
//             email,
//         })) as GetUserDetailsByEmailResponse;
//         return NextResponse.json({
//             userDetails: userDetails.userDetails,
//         });
//     }
//     catch (error) {
//         console.error("API error:", error);
//         return NextResponse.json(
//             { error: "Failed to fetch user details by email" },
//             { status: 500 }
//         );
//     }
// }