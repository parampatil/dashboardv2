// app/api/grpc/consumerpurchase/available-offers/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { AvailableOffersResponse } from '@/types/grpc';

export async function POST(request: Request) {
    try {
        const { country } = await request.json();
        
        // Get environment from request header
        const environment = getEnvironmentFromRequest(request);
        
        // Create clients for the specified environment
        const clients = createServiceClients(environment);
        
        // Create service with promisified methods
        const consumerPurchaseService = {
            getAvailableOffers: promisify(clients.consumerPurchase.AvailableOffers.bind(clients.consumerPurchase))
        };

        const availableOffers = await consumerPurchaseService.getAvailableOffers({ country }) as AvailableOffersResponse;
        
        return NextResponse.json({
            offers: availableOffers.offers
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({error: error, message: "Failed to fetch available offers"}, { status: 500 });
    }
}
