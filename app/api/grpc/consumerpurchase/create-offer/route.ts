// app/api/grpc/consumerpurchase/create-offer/route.ts
import { NextResponse } from 'next/server';
import { createServiceClients, getEnvironmentFromRequest } from '@/app/api/grpc/client';
import { promisify } from 'util';
import { CreateOfferResponse, CreateOfferRequest } from '@/types/grpc';

export async function POST(request: Request) {
    try {
        const { country, currency, numberOfMinutes, offerName, totalPrice } = 
            await request.json() as CreateOfferRequest;
            
        // Get environment from request header
        const environment = getEnvironmentFromRequest(request);
        
        // Create clients for the specified environment
        const clients = createServiceClients(environment);
        
        // Create service with promisified methods
        const consumerPurchaseService = {
            createOffer: promisify(clients.consumerPurchase.CreateOffer.bind(clients.consumerPurchase))
        };

        const offer = await consumerPurchaseService.createOffer({ 
            country, 
            currency, 
            numberOfMinutes, 
            offerName, 
            totalPrice 
        }) as CreateOfferResponse;
        
        return NextResponse.json({
            offerId: offer.offerId
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({error: error, message: "Failed to create offer"}, { status: 500 });
    }
}
