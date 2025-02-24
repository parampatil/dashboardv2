// types/grpc.ts
import type { ServiceError } from '@grpc/grpc-js';

export interface GetTotalPageCountRequest {
  perPageEntries: number;
}

export interface GetTotalPageCountResponse {
  totalUserCount: number;
  totalPageCount: number;
}

export interface GetAllUsersRequest {
  pageSize: number;
  pageNumber: number;
}

export interface User {
  userId: number;
  displayName: string;
  email: string;
  createdTimestamp: { seconds: number | string; nanos: number };
  country: string;
}

export interface GetAllUsersResponse {
  users: User[];
  totalCount: number;
}

export interface ProfileServiceClient {
  GetTotalPageCount(
    request: GetTotalPageCountRequest,
    callback: (error: ServiceError | null, response: GetTotalPageCountResponse) => void
  ): void;
  
  GetAllUsers(
    request: GetAllUsersRequest,
    callback: (error: ServiceError | null, response: GetAllUsersResponse) => void
  ): void;
}

// Client interface for user-related gRPC services
export interface UserServiceClient {
  GetUserDetailsByUserId: (
    request: { userId: string },
    callback: (error: Error | null, response: UserDetailsResponse) => void
  ) => void;
}

// Client interface for consumer balance gRPC services
export interface ConsumerBalanceClient {
  GetConsumerPurchaseBalance: (
    request: { userId: string },
    callback: (error: Error | null, response: { consumerPurchaseBalance: number }) => void
  ) => void;
}

// Client interface for provider balance gRPC services
export interface ProviderBalanceClient {
  GetProviderEarningBalance: (
    request: { userId: string },
    callback: (error: Error | null, response: { providerEarningBalance: number, currency: string }) => void
  ) => void;
}
// Response type for user details
export interface UserDetailsResponse {
  user: {
    uid: string;
    userName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    displayName: string;
    phoneNumber: string;
    email: string;
    pin: string;
    bio: string;
    userType: string;
    proximityAsSkill: string;
    createdTimestamp: {
      seconds: string;
      nanos: number;
    };
    lastUpdatedTimestamp: {
      seconds: string;
      nanos: number;
    };
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
    userId: string;
    passwordHash: string;
    country: string;
  };
}

// Response type for consumer balance
export interface ConsumerBalanceResponse {
  consumerPurchaseBalance: number;
}

// Response type for provider balance
export interface ProviderBalanceResponse {
  providerEarningBalance: number;
  currency: string;
}