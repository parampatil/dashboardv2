// api/grpc/services/balance.ts
import { clients } from '../client';
import { promisify } from 'util';
import type { 
  ConsumerPurchaseServiceClient, 
  ProviderEarningServiceClient 
} from '@/types/grpc';

const consumerClient = clients.consumerPurchase as unknown as ConsumerPurchaseServiceClient;
const providerClient = clients.providerEarning as unknown as ProviderEarningServiceClient;

export const balanceService = {
  getConsumerBalance: promisify(consumerClient.GetConsumerPurchaseBalance.bind(consumerClient)),
  getProviderBalance: promisify(providerClient.GetProviderEarningBalance.bind(providerClient))
};
