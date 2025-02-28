// api/grpc/services/ConsumerPurchaseDev/createOffer.ts
import { clients } from '../../client';
import { promisify } from 'util';
import type { ConsumerPurchaseDevServiceClient } from '@/types/grpc';

const consumerClient = clients.consumerPurchaseDev as unknown as ConsumerPurchaseDevServiceClient;

export const consumerPurchaseDevService = {
  createOffer: promisify(consumerClient.CreateOffer.bind(consumerClient))
};