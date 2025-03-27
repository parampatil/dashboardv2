// // app/api/grpc/mp2/dictionary/get-crime-words/route.ts
// import { NextResponse } from 'next/server';
// import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
// import { promisify } from 'util';
// import { GetCrimeWordsByCategoryRequest, GetCrimeWordsByCategoryResponse } from '@/types/grpc';

// export async function POST(request: Request) {
//   try {
//     const { category } = await request.json() as GetCrimeWordsByCategoryRequest;
    
//     const environment = getEnvironmentFromRequest(request);
//     const clients = createServiceClients(environment);
    
//     const mp2Service = {
//       getCrimeWordsByCategory: promisify(clients.mp2.GetCrimeWordsByCategory.bind(clients.mp2))
//     };

//     const response = await mp2Service.getCrimeWordsByCategory({ category }) as GetCrimeWordsByCategoryResponse;
    
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('API error:', error);
//     return NextResponse.json({ error: error, message: 'Failed to get crime words' }, { status: 500 });
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