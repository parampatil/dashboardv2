// // app/api/grpc/client.ts
// import * as protoLoader from '@grpc/proto-loader';
// import * as grpc from '@grpc/grpc-js';
// import path from 'path';

// const PROTO_PATH = path.resolve('./proto/profile.proto');

// const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });

// interface ProtoGrpcType {
//   ProfileService: typeof grpc.Client;
// }

// const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
// const client = new protoDescriptor.ProfileService(
//   'api.360world.com:32394', 
//   grpc.credentials.createInsecure()
// );

// export default client;

// app/api/grpc/client.ts
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import path from 'path';

// Define URLs as constants
const SERVICE_URLS = {
  PROFILE: 'api.360world.com:32394',
  CONSUMER_BALANCE: 'api.360world.com:31128',
  PROVIDER_BALANCE: 'api.360world.com:30116'
} as const;

// Load the proto file
const PROFILE_PROTO_PATH = path.resolve('./proto/profile.proto');
const CONSUMER_PURCHASE_PROTO_PATH = path.resolve('./proto/consumerPurchase.proto');
const PROVIDER_EARNING_PROTO_PATH = path.resolve('./proto/providerEarning.proto');

const profilePackageDefinition = protoLoader.loadSync(PROFILE_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const consumerPurchasePackageDefinition = protoLoader.loadSync(CONSUMER_PURCHASE_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const providerEarningPackageDefinition = protoLoader.loadSync(PROVIDER_EARNING_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});


interface ProtoGrpcType {
  ProfileService: typeof grpc.Client;
  ConsumerPurchaseService: typeof grpc.Client;
  ProviderEarningService: typeof grpc.Client;
}

// Create individual clients for each service
const profileProtoDescriptor = grpc.loadPackageDefinition(profilePackageDefinition) as unknown as ProtoGrpcType;
const consumerPurchaseProtoDescriptor = grpc.loadPackageDefinition(consumerPurchasePackageDefinition) as unknown as ProtoGrpcType;
const providerEarningProtoDescriptor = grpc.loadPackageDefinition(providerEarningPackageDefinition) as unknown as ProtoGrpcType;

// Create typed clients
const profileClient = new profileProtoDescriptor.ProfileService(
  SERVICE_URLS.PROFILE,
  grpc.credentials.createInsecure()
);

const consumerBalanceClient = new consumerPurchaseProtoDescriptor.ConsumerPurchaseService(
  SERVICE_URLS.CONSUMER_BALANCE,
  grpc.credentials.createInsecure()
);

const providerBalanceClient = new providerEarningProtoDescriptor.ProviderEarningService(
  SERVICE_URLS.PROVIDER_BALANCE,
  grpc.credentials.createInsecure()
);

// Export all clients
export const clients = {
  profile: profileClient,
  consumerBalance: consumerBalanceClient,
  providerBalance: providerBalanceClient
};
