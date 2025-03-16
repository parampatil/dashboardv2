// app/api/grpc/client.ts
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import path from 'path';
import { environments } from '@/config/environments';

// Default environment if not specified
const DEFAULT_ENV = process.env.API_ENVIRONMENT as 'dev' | 'preprod' | 'prod' || 'dev';

const PROTO_PATHS = {
  PROFILE: path.resolve('./proto/profile.proto'),
  CONSUMER_PURCHASE: path.resolve('./proto/consumerPurchase.proto'),
  PROVIDER_EARNING: path.resolve('./proto/providerEarning.proto'),
  REWARD: path.resolve('./proto/reward.proto')
};

// Get environment from request header or use default
export const getEnvironmentFromRequest = (req?: Request): 'dev' | 'preprod' | 'prod' => {
  if (req) {
    const envHeader = req.headers.get('x-environment');
    if (envHeader && ['dev', 'preprod', 'prod'].includes(envHeader)) {
      return envHeader as 'dev' | 'preprod' | 'prod';
    }
  }
  return DEFAULT_ENV;
};

// Create and export service clients for a specific environment
export const createServiceClients = (environment: 'dev' | 'preprod' | 'prod' = DEFAULT_ENV) => {
  const SERVICE_URLS = environments[environment].serviceUrls;
  
  return {
    profile: createServiceClient('ProfileService', PROTO_PATHS.PROFILE, SERVICE_URLS.PROFILE),
    consumerPurchase: createServiceClient('ConsumerPurchaseService', PROTO_PATHS.CONSUMER_PURCHASE, SERVICE_URLS.CONSUMER_PURCHASE),
    providerEarning: createServiceClient('ProviderEarningService', PROTO_PATHS.PROVIDER_EARNING, SERVICE_URLS.PROVIDER_EARNING),
    reward: createServiceClient('RewardService', PROTO_PATHS.REWARD, SERVICE_URLS.REWARD)
  };
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
    ProviderEarningService: typeof grpc.Client;
    RewardService: typeof grpc.Client;
  }
  
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
  return new (protoDescriptor as unknown as ProtoGrpcType)[serviceName](
    serviceUrl,
    grpc.credentials.createInsecure()
  );
}
