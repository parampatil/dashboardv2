// // app/api/grpc/mp2/jailbreak-user/route.ts
// import { NextResponse } from 'next/server';
// import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
// import { JailbreakUserResponse } from '@/types/grpc';
// import * as grpc from "@grpc/grpc-js";

// export async function POST(request: Request) {
//   try {
//     const { user_id } = await request.json();
//     const environment = getEnvironmentFromRequest(request);
//     const clients = createServiceClients(environment);
//     const bearerToken = process.env.MPSQUARE_BEARER_TOKEN;

//     // Create metadata with authorization
//     const metadata = new grpc.Metadata();
//     metadata.add('Authorization', `Bearer ${bearerToken}`);
    
//     const mpSquareService = {
//       JailbreakUser: (requestData: object) =>
//         new Promise((resolve, reject) => {
//           clients.mpSquare.JailbreakUser(
//             requestData,
//             metadata,
//             (error: grpc.ServiceError | null, response: JailbreakUserResponse) => {
//               if (error) {
//                 reject(error);
//               } else {
//                 resolve(response);
//               }
//             }
//           );
//         }),
//     };

//     // Pass metadata as the second argument
//     const response = await mpSquareService.JailbreakUser({ user_id }, metadata) as JailbreakUserResponse;
    
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('API error:', error);
//     return NextResponse.json({ error: error, message: 'Failed to jailbreak user' }, { status: 500 });
//   }
// }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    // Your logic here...
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}