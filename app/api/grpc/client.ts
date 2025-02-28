// api/grpc/client.ts
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import path from 'path';

const SERVICE_URLS = {
  PROFILE: 'api.360world.com:32394',
  CONSUMER_PURCHASE: 'api.360world.com:31128',
  CONSUMER_PURCHASE_DEV: 'api.360world.com:31451',
  PROVIDER_BALANCE: 'api.360world.com:30116',
  REWARD: 'api.360world.com:32064'
} as const;

const PROTO_PATHS = {
  PROFILE: path.resolve('./proto/profile.proto'),
  CONSUMER_PURCHASE: path.resolve('./proto/consumerPurchase.proto'),
  CONSUMER_PURCHASE_DEV: path.resolve('./proto/consumerPurchaseDev.proto'),
  PROVIDER_EARNING: path.resolve('./proto/providerEarning.proto'),
  REWARD: path.resolve('./proto/reward.proto')
};

// Create and export service clients
export const clients = {
  profile: createServiceClient('ProfileService', PROTO_PATHS.PROFILE, SERVICE_URLS.PROFILE),
  consumerPurchase: createServiceClient('ConsumerPurchaseService', PROTO_PATHS.CONSUMER_PURCHASE, SERVICE_URLS.CONSUMER_PURCHASE),
  consumerPurchaseDev: createServiceClient('ConsumerPurchaseService', PROTO_PATHS.CONSUMER_PURCHASE_DEV, SERVICE_URLS.CONSUMER_PURCHASE_DEV),
  providerEarning: createServiceClient('ProviderEarningService', PROTO_PATHS.PROVIDER_EARNING, SERVICE_URLS.PROVIDER_BALANCE),
  reward: createServiceClient('RewardService', PROTO_PATHS.REWARD, SERVICE_URLS.REWARD)
};

function createServiceClient(serviceName: string, protoPath: string, serviceUrl: string) {
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });

  interface ProtoGrpcType {
    [key: string]: typeof grpc.Client;
    ProfileService: typeof grpc.Client;
    ConsumerPurchaseService: typeof grpc.Client;
    ConsumerPurchaseDevService: typeof grpc.Client; 
    ProviderEarningService: typeof grpc.Client;
    RewardService: typeof grpc.Client;
  }
  
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
  return new (protoDescriptor as unknown as ProtoGrpcType)[serviceName](
    serviceUrl,
    grpc.credentials.createInsecure()
  );
}
