// app/api/grpc/location/active-user-ids/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllActiveUserIdsResponse } from '@/types/grpc';
import { convertInt64BinaryToBigInt } from '@/lib/utils';
export async function GET(request: Request) {
  try {
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create service with promisified methods
    const locationService = {
      getAllActiveUserIds: promisify(clients.location.GetAllActiveUserIds.bind(clients.location))
    };

    // Call the service with empty request
    const response = await locationService.getAllActiveUserIds({}) as GetAllActiveUserIdsResponse;

    // Convert the response keys to BigInt
    if (response.caches) {
      for (const cacheId in response.caches) {
        if (response.caches[cacheId].locations) {
          const locations = response.caches[cacheId].locations;
          
          // Extract binary keys
          const binaryKeys = Object.keys(locations);
          
          // Convert binary keys to BigInt and create a mapping
          const keyMapping: Record<string, string> = {};
          const bigIntKeys = binaryKeys.map(key => {
            const bigIntValue = convertInt64BinaryToBigInt(key);
            keyMapping[bigIntValue as string] = key;
            return bigIntValue;
          });
          
          // Sort the BigInt keys
          bigIntKeys.sort();
          
          // Create a new sorted locations object
          const sortedLocations: Record<string, typeof locations[keyof typeof locations]> = {};
          bigIntKeys.forEach(bigIntKey => {
            const originalKey = keyMapping[bigIntKey as string];
            if (originalKey) {
              // Get the location data
              const locationData = locations[originalKey as unknown as keyof typeof locations];
              
              // Sort the providerIds array if it exists
              if (locationData.providerIds && Array.isArray(locationData.providerIds)) {
                // Sort providerIds as strings
                locationData.providerIds.sort();
              }
              
              // Add the location with sorted providerIds to the result
              sortedLocations[bigIntKey as string] = locationData;
            }
          });
          
          // Replace the original locations with sorted ones
          response.caches[cacheId].locations = sortedLocations;
        }
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch location data' }, { status: 500 });
  }
}
