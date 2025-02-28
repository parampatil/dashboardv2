// api/grpc/services/CustomerPurchaseDev/getAvailableOffers.ts

import { clients } from '../../client';
import { promisify } from 'util';
import type { ConsumerPurchaseDevServiceClient } from '@/types/grpc';

const consumerClient = clients.consumerPurchaseDev as unknown as ConsumerPurchaseDevServiceClient;

export const consumerPurchaseDevService = {
  getAvailableOffers: promisify(consumerClient.AvailableOffers.bind(consumerClient))
};