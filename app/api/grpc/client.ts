// app/api/grpc/client.ts (update)
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";
import path from "path";
import { environments } from "@/config/environments";
import fs from "fs";
import {
  ProfileServiceClient,
  ConsumerPurchaseServiceClient,
  RewardServiceClient,
  ProviderEarningServiceClient,
  LocationServiceClient,
  CallManagementServiceClient,
  MPSquareServiceClient,
  DenyListServiceClient,
  OneGuardServiceClient,
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
  DENY_LIST: path.resolve("./proto/denyList.proto"),
  ONEGUARD: path.resolve("./proto/one-guard-service.proto"),
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
      environment
    ),
    consumerPurchase: createServiceClient<ConsumerPurchaseServiceClient>(
      "ConsumerPurchaseService",
      PROTO_PATHS.CONSUMER_PURCHASE,
      SERVICE_URLS.CONSUMER_PURCHASE,
      environment
    ),
    providerEarning: createServiceClient<ProviderEarningServiceClient>(
      "ProviderEarningService",
      PROTO_PATHS.PROVIDER_EARNING,
      SERVICE_URLS.PROVIDER_EARNING,
      environment
    ),
    reward: createServiceClient<RewardServiceClient>(
      "RewardService",
      PROTO_PATHS.REWARD,
      SERVICE_URLS.REWARD,
      environment
    ),
    location: createServiceClient<LocationServiceClient>(
      "LocationService",
      PROTO_PATHS.LOCATION,
      SERVICE_URLS.LOCATION,
      environment
    ),
    callManagement: createServiceClient<CallManagementServiceClient>(
      "CallManagementService",
      PROTO_PATHS.CALL_MANAGEMENT,
      SERVICE_URLS.CALL_MANAGEMENT,
      environment
    ),
    mpSquare: createServiceClient<MPSquareServiceClient>(
      "MPSquare",
      PROTO_PATHS.MPSQUARE,
      SERVICE_URLS.MPSQUARE,
      environment
    ),
    denyList: createServiceClient<DenyListServiceClient>(
      "DenyListService",
      PROTO_PATHS.DENY_LIST,
      SERVICE_URLS.DENY_LIST,
      environment
    ),
    oneGuard: createServiceClient<OneGuardServiceClient>(
      "OneGuardService",
      PROTO_PATHS.ONEGUARD,
      SERVICE_URLS.ONEGUARD,
      environment
    ),
  };
};

function createServiceClient<T>(
  serviceName: string,
  protoPath: string,
  serviceUrl: string,
  environment: string,
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
    denyList: {
      [key: string]: typeof grpc.Client;
    };
    oneguard: {
      [key: string]: typeof grpc.Client;
    }
  }

  const protoDescriptor = grpc.loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoGrpcType;

  if (serviceName === "DenyListService") {
    return new (protoDescriptor.denyList)[serviceName](
      serviceUrl,
      grpc.credentials.createSsl(),
    ) as T;
  }

  if (serviceName === "OneGuardService") {
    return new (protoDescriptor.oneguard)[serviceName](
      serviceUrl,
      grpc.credentials.createSsl(),
    ) as T;
  }

  if (serviceName === "MPSquare" && environment === "prod") {
    const rootCertPath = path.resolve("./config/main-ssl.crt");
    const rootCert = fs.readFileSync(rootCertPath);
    
    // Temporary workaround for gRPC-js limitation
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Only for development!
  
   return new (protoDescriptor.MPSquare)[serviceName](
    serviceUrl,
      grpc.credentials.createSsl(
        rootCert,
        null,
        null,
        {
          checkServerIdentity: () => {
            console.warn('Bypassing TLS certificate validation - DEV ONLY');
            return undefined;
          }
        }
      )
    ) as T;
  }

  if (environment === "prod") {
    const rootCertPath = path.resolve("./config/main-ssl.crt");
    const rootCert = fs.readFileSync(rootCertPath);
    
    // Temporary workaround for gRPC-js limitation
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Only for development!
  
   return new (protoDescriptor[serviceName as keyof ProtoGrpcType] as typeof grpc.Client)(
    serviceUrl,
      grpc.credentials.createSsl(
        rootCert,
        null,
        null,
        {
          checkServerIdentity: () => {
            console.warn('Bypassing TLS certificate validation - DEV ONLY');
            return undefined;
          }
        }
      )
    ) as T;
  }

  return new (protoDescriptor[serviceName as keyof ProtoGrpcType] as typeof grpc.Client)(
    serviceUrl,
    grpc.credentials.createInsecure(),
  ) as T;

}
