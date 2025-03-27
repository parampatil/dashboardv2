// // app/api/grpc/mp2/check-user-status/route.ts
// import { NextResponse } from 'next/server';
// import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
// import { CheckUserStatusResponse } from '@/types/grpc';
// import * as grpc from '@grpc/grpc-js';

// export async function POST(request: Request) {
//     try {
//         const { user_id } = await request.json();
//         const environment = getEnvironmentFromRequest(request);
//         const clients = createServiceClients(environment);
//         const bearerToken = process.env.MPSQUARE_BEARER_TOKEN;

//         if (!bearerToken) {
//             throw new Error('Missing bearer token in environment variables');
//         }

//         // Create metadata with authorization
//         const metadata = new grpc.Metadata();
//         metadata.add('Authorization', `Bearer ${bearerToken}`);

//         const mpSquareService = {
//             CheckUserStatus: (requestData: object) =>
//                 new Promise((resolve, reject) => {
//                     clients.mpSquare.CheckUserStatus(
//                         requestData,
//                         metadata,
//                         (error: grpc.ServiceError | null, response: CheckUserStatusResponse) => {
//                             if (error) {
//                                 reject(error);
//                             } else {
//                                 resolve(response);
//                             }
//                         }
//                     );
//                 }),
//         };

//         // Call the method
//         // Suppress the type-checking error for this line
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         const response = await mpSquareService.CheckUserStatus({ user_id }) as CheckUserStatusResponse;

//         return NextResponse.json(response);
//     } catch (error) {
//         console.error('API error:', error);
//         return NextResponse.json({ error: error.message, message: 'Failed to check user status' }, { status: 500 });
//     }
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