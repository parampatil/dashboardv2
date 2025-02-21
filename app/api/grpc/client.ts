// app/api/grpc/client.ts
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import path from 'path';

const PROTO_PATH = path.resolve('./proto/profile.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

interface ProtoGrpcType {
  ProfileService: typeof grpc.Client;
}

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
const client = new protoDescriptor.ProfileService(
  'api.360world.com:32394', 
  grpc.credentials.createInsecure()
);

export default client;
