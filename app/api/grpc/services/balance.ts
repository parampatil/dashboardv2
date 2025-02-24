// app/api/grpc/services/balance.ts
import { clients } from '../client';
import { promisify } from 'util';
import type { ConsumerBalanceClient, ProviderBalanceClient } from '@/types/grpc';

const consumerClient = clients.consumerBalance as unknown as ConsumerBalanceClient;
const providerClient = clients.providerBalance as unknown as ProviderBalanceClient;

export const balanceService = {
  getConsumerBalance: promisify(consumerClient.GetConsumerPurchaseBalance.bind(consumerClient)),
  getProviderBalance: promisify(providerClient.GetProviderEarningBalance.bind(providerClient))
};
