// // app/api/grpc/mp2/dictionary/add-crime-word-variant/route.ts
// import { NextResponse } from 'next/server';
// import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
// import { promisify } from 'util';
// import { AddCrimeWordVariantRequest, AddCrimeWordVariantResponse } from '@/types/grpc';

// export async function POST(request: Request) {
//   try {
//     const { crimeWordId, variant } = await request.json() as AddCrimeWordVariantRequest;
    
//     const environment = getEnvironmentFromRequest(request);
//     const clients = createServiceClients(environment);
    
//     const mp2Service = {
//       addCrimeWordVariant: promisify(clients.mp2.AddCrimeWordVariant.bind(clients.mp2))
//     };

//     const response = await mp2Service.addCrimeWordVariant({ crimeWordId, variant }) as AddCrimeWordVariantResponse;
    
//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('API error:', error);
//     return NextResponse.json({ error: error, message: 'Failed to add crime word variant' }, { status: 500 });
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