// api/grpc/consumerpurchasedev/getAvailableOffers/route.ts
import { NextResponse } from 'next/server';
import { consumerPurchaseDevService } from '../../services/ConsumerPurchaseDev/createOffer';
import { CreateOfferResponse, CreateOfferRequest } from '@/types/grpc';

export async function POST(request: Request) {
    try{
        const { country, currency, numberOfMinutes, offerName, totalPrice } = await request.json() as CreateOfferRequest;

        const offer = await consumerPurchaseDevService.createOffer({ country, currency, numberOfMinutes, offerName, totalPrice }) as CreateOfferResponse;
        return NextResponse.json({
            offerId: offer.offerId
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({error:error, message: "Failed to create offer"}, { status: 500 });
    }
}
