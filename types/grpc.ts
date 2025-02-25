// types/grpc.ts

// Profile Service Types
export interface ProfileServiceClient {
  GetTotalPageCount: (params: PageCountRequest) => Promise<PageCountResponse>;
  GetAllUsers: (params: UsersRequest) => Promise<UsersResponse>;
  GetUserDetailsByUserId: (params: UserDetailsRequest) => Promise<UserDetailsResponse>;
}

export interface PageCountRequest {
  perPageEntries: number;
}

export interface PageCountResponse {
  totalUserCount: number;
  totalPageCount: number;
}

export interface UsersRequest {
  pageNumber: number;
  pageSize: number;
}

export interface UsersResponse {
  users: User[];
}

export interface UserDetailsRequest {
  userId: string;
}

export interface UserDetailsResponse {
  user: User;
}

export interface User {
  userId: string;
  displayName: string;
  email: string;
  userType: string;
  country: string;
  createdTimestamp: UserTimestamp;
  lastUpdatedTimestamp: UserTimestamp;
  phoneNumber?: string;
  userName: string;
}

// Consumer Purchase Service Types
export interface ConsumerPurchaseServiceClient {
  GetConsumerPurchaseBalance: (params: BalanceRequest) => Promise<ConsumerBalanceResponse>;
}

export interface BalanceRequest {
  userId: string;
}

export interface ConsumerBalanceResponse {
  consumerPurchaseBalance: number;
}

// Provider Earning Service Types
export interface ProviderEarningServiceClient {
  GetProviderEarningBalance: (params: BalanceRequest) => Promise<ProviderBalanceResponse>;
}

export interface ProviderBalanceResponse {
  providerEarningBalance: number;
  currency: string;
}


// Helper interface to format protobuf timestamp
export interface UserTimestamp {
    seconds: string;
    nanos: number;
  }