// app/api/grpc/location/active-user-ids/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { GetAllActiveUserIdsResponse, GetAllUserIdsAndNamesDashboardResponse } from '@/types/grpc';
import { Provider } from '@/types/location';
import { convertInt64BinaryToBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    // Get environment from request header
    const environment = getEnvironmentFromRequest(request);
    
    // Create clients for the specified environment
    const clients = createServiceClients(environment);
    
    // Create services with promisified methods
    const locationService = {
      getAllActiveUserIds: promisify(clients.location.GetAllActiveUserIds.bind(clients.location))
    };
    
    const profileService = {
      getAllUserIdsAndNamesDashboard: promisify(clients.profile.GetAllUserIdsAndNamesDashboard.bind(clients.profile))
    };

    // Fetch location data and user names in parallel
    const [locationResponse, userNamesResponse] = await Promise.all([
      locationService.getAllActiveUserIds({}) as Promise<GetAllActiveUserIdsResponse>,
      profileService.getAllUserIdsAndNamesDashboard({}) as Promise<GetAllUserIdsAndNamesDashboardResponse>
    ]);

    // Create a mapping of user IDs to names
    const userIdToNameMap = userNamesResponse.userIdsAndNames || {};

    // Process the response
    if (locationResponse.caches) {
      for (const cacheId in locationResponse.caches) {
        if (locationResponse.caches[cacheId].locations) {
          const locations = locationResponse.caches[cacheId].locations;
          
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
          
          // Create a new sorted locations object with the same structure as the original
          const sortedLocations: Record<string, {
            latitude: number;
            longitude: number;
            providerIds: string[];
            providers: Provider[];
          }> = {};
          
          for (const bigIntKey of bigIntKeys) {
            const originalKey = keyMapping[bigIntKey as string];
            if (originalKey) {
              const locationData = locations[originalKey as unknown as keyof typeof locations];
              
              if (locationData.providerIds && Array.isArray(locationData.providerIds)) {
                // Sort providerIds
                const sortedProviderIds = [...locationData.providerIds].sort();
                
                // Map provider IDs to Provider objects with names from the API response
                const providers: Provider[] = sortedProviderIds.map(id => ({
                  id: id.toString(),
                  name: userIdToNameMap[id] || `Provider ${id}`
                }));
                
                // Add the location with providers to the result
                // Maintain the original structure while adding the providers array
                sortedLocations[bigIntKey as string] = {
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  providerIds: sortedProviderIds,
                  providers: providers
                };
              }
            }
          }
          
          // Replace the original locations with sorted ones
          locationResponse.caches[cacheId].locations = sortedLocations;
        }
      }
    }
    
    return NextResponse.json(locationResponse);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error, message: 'Failed to fetch location data' }, { status: 500 });
  }
}
