// api/grpc/consumerpurchasedev/getAvailableOffers/route.ts
import { NextResponse } from 'next/server';
import { consumerPurchaseDevService } from '../../services/ConsumerPurchaseDev/getAvailableOffers';
import { AvailableOffersResponse } from '@/types/grpc';

export async function POST(request: Request) {
    try{
        const { country } = await request.json();

        const availableOffers = await consumerPurchaseDevService.getAvailableOffers({ country }) as AvailableOffersResponse;
        return NextResponse.json({
            offers: availableOffers.offers
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch available offers' }, { status: 500 });
    }
}