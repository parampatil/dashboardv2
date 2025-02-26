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
  GetConsumerPurchaseHistory: (params: ConsumerPurchaseHistoryRequest) => Promise<ConsumerPurchaseHistoryResponse>;
}

export interface BalanceRequest {
  userId: string;
}

export interface ConsumerBalanceResponse {
  consumerPurchaseBalance: number;
}

export interface ConsumerPurchaseHistoryRequest {
  userId: string;
}

export interface ConsumerPurchaseHistoryResponse {
  consumerPurchaseHistory: PurchaseHistory[];
}

export interface PurchaseHistory {
  transactionId: string;
  offerName: string;
  totalMinutes: number;
  totalUnusedMinutes: number;
  totalRefundAmount: number;
  purchaseTimestamp: UserTimestamp;
  purchaseAmount: number;
  purchaseCurrency: string;
  refundStatus: string;
}

// Provider Earning Service Types
export interface ProviderEarningServiceClient {
  GetProviderEarningBalance: (params: BalanceRequest) => Promise<ProviderBalanceResponse>;
  GetProviderEarningTransactions: (params: ProviderEarningTransactionsRequest) => Promise<ProviderEarningTransactionsResponse>;
}

export interface ProviderBalanceResponse {
  providerEarningBalance: number;
  currency: string;
}

export interface ProviderEarningTransactionsRequest {
  userId: string;
}

export interface ProviderEarningTransactionsResponse {
  providerTransactionHistory: ProviderEarningTransactions[];
}

export interface ProviderEarningTransactions {
  transactionId: string;
  transactionTimestamp: UserTimestamp;
  callDuration: number;
  rate: number;
  currency: string;
  amount: number;
  transactionType: string;
  status: string;
}


// Helper interface to format protobuf timestamp
export interface UserTimestamp {
    seconds: string;
    nanos: number;
  }