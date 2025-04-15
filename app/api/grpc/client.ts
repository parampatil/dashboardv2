// app/api/grpc/client.ts (update)
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";
import path from "path";
import { environments } from "@/config/environments";
import {
  ProfileServiceClient,
  ConsumerPurchaseServiceClient,
  RewardServiceClient,
  ProviderEarningServiceClient,
  LocationServiceClient,
  CallManagementServiceClient,
  MPSquareServiceClient,
} from "@/types/grpc";

// Default environment if not specified
const DEFAULT_ENV =
  (process.env.DEFAULT_API_ENVIRONMENT as "dev" | "preprod" | "prod") || "dev";

const PROTO_PATHS = {
  PROFILE: path.resolve("./proto/profile.proto"),
  CONSUMER_PURCHASE: path.resolve("./proto/consumerPurchase.proto"),
  PROVIDER_EARNING: path.resolve("./proto/providerEarning.proto"),
  REWARD: path.resolve("./proto/reward.proto"),
  LOCATION: path.resolve("./proto/location.proto"),
  CALL_MANAGEMENT: path.resolve("./proto/callManagementService.proto"),
  MPSQUARE: path.resolve("./proto/MPSquare.proto"),
};

// Get environment from request header or use default
export const getEnvironmentFromRequest = (
  req?: Request
): "dev" | "preprod" | "prod" => {
  if (req) {
    const envHeader = req.headers.get("x-environment");
    if (envHeader && ["dev", "preprod", "prod"].includes(envHeader)) {
      return envHeader as "dev" | "preprod" | "prod";
    }
  }
  return DEFAULT_ENV;
};

// Create and export service clients for a specific environment
export const createServiceClients = (
  environment: "dev" | "preprod" | "prod" = DEFAULT_ENV
) => {
  const SERVICE_URLS = environments[environment].serviceUrls;

  return {
    profile: createServiceClient<ProfileServiceClient>(
      "ProfileService",
      PROTO_PATHS.PROFILE,
      SERVICE_URLS.PROFILE,
    ),
    consumerPurchase: createServiceClient<ConsumerPurchaseServiceClient>(
      "ConsumerPurchaseService",
      PROTO_PATHS.CONSUMER_PURCHASE,
      SERVICE_URLS.CONSUMER_PURCHASE,
    ),
    providerEarning: createServiceClient<ProviderEarningServiceClient>(
      "ProviderEarningService",
      PROTO_PATHS.PROVIDER_EARNING,
      SERVICE_URLS.PROVIDER_EARNING,
    ),
    reward: createServiceClient<RewardServiceClient>(
      "RewardService",
      PROTO_PATHS.REWARD,
      SERVICE_URLS.REWARD,
    ),
    location: createServiceClient<LocationServiceClient>(
      "LocationService",
      PROTO_PATHS.LOCATION,
      SERVICE_URLS.LOCATION,
    ),
    callManagement: createServiceClient<CallManagementServiceClient>(
      "CallManagementService",
      PROTO_PATHS.CALL_MANAGEMENT,
      SERVICE_URLS.CALL_MANAGEMENT,
    ),
    mpSquare: createServiceClient<MPSquareServiceClient>(
      "MPSquare",
      PROTO_PATHS.MPSQUARE,
      SERVICE_URLS.MPSQUARE,
    ),
  };
};

function createServiceClient<T>(
  serviceName: string,
  protoPath: string,
  serviceUrl: string,
): T {
  const packageDefinition = protoLoader.loadSync(protoPath, {
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
    RewardService: typeof grpc.Client;
    LocationService: typeof grpc.Client;
    CallManagementService: typeof grpc.Client;
    MPSquare: {
      [key: string]: typeof grpc.Client;
    };
  }

  const protoDescriptor = grpc.loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoGrpcType;

  if (serviceName === "MPSquare") {
    return new (protoDescriptor.MPSquare)[serviceName](
      serviceUrl,
      grpc.credentials.createInsecure(),
    ) as T;
  }

  if (serviceName === "LocationService") {
    return new (protoDescriptor)[serviceName](
      serviceUrl,
      grpc.credentials.createSsl(),
    ) as T;
  }

  return new (protoDescriptor[serviceName as keyof ProtoGrpcType] as typeof grpc.Client)(
    serviceUrl,
    grpc.credentials.createInsecure(),
  ) as T;

}
