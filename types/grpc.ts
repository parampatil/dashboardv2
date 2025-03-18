// types/grpc.ts
import * as grpc from '@grpc/grpc-js';

// Profile Service Types
export interface ProfileServiceClient extends grpc.Client {
  GetUserDetailsByEmail: (request: GetUserDetailsByEmailRequest, callback: (error: Error | null, response: GetUserDetailsByEmailResponse) => void) => void;
  GetAllUsers: (request: UsersRequest, callback: (error: Error | null, response: UsersResponse) => void) => void;
  GetUserDetailsByUserId: (request: UserDetailsRequest, callback: (error: Error | null, response: UserDetailsResponse) => void) => void;
  GetTotalPageCount: (request: PageCountRequest, callback: (error: Error | null, response: PageCountResponse) => void) => void;
  // Add other methods as needed
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

export interface GetUserDetailsByEmailRequest {
  email_prefix: string;
}

export interface GetUserDetailsByEmailResponse {
  users: User[];
  total_count: number;
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
export interface ConsumerPurchaseServiceClient extends grpc.Client {
  AvailableOffers: (request: AvailableOffersRequest, callback: (error: Error | null, response: AvailableOffersResponse) => void) => void;
  CreateOffer: (request: CreateOfferRequest, callback: (error: Error | null, response: CreateOfferResponse) => void) => void;
  GetConsumerPurchaseBalance: (request: BalanceRequest, callback: (error: Error | null, response: ConsumerBalanceResponse) => void) => void;
  GetConsumerPurchaseHistory: (request: ConsumerPurchaseHistoryRequest, callback: (error: Error | null, response: ConsumerPurchaseHistoryResponse) => void) => void;
  // Add other methods as needed
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

export interface Offer {
  offerId: string;
  offerName: string;
  numberOfMinutes: number;
  totalPrice: number;
  pricePerMinute: number;
  currency: string;
  country: string;
}

export interface AvailableOffersRequest {
  country: string;
}

export interface AvailableOffersResponse {
  offers: Offer[];
}

export interface CreateOfferRequest {
  country: string;
  currency: string;
  numberOfMinutes: number;
  offerName: string;
  totalPrice: number;
}

export interface CreateOfferResponse {
  offerId: number;
}

// Provider Earning Service Types
export interface ProviderEarningServiceClient extends grpc.Client {
  GetProviderEarningBalance: (request: BalanceRequest, callback: (error: Error | null, response: ProviderBalanceResponse) => void) => void;
  GetProviderEarningTransactions: (request: ProviderEarningTransactionsRequest, callback: (error: Error | null, response: ProviderEarningTransactionsResponse) => void) => void;
  // Add other methods as needed
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


// Reward Service Types
export interface RewardServiceClient extends grpc.Client {
  getAvailableRewards: (request: Record<string, never>, callback: (error: Error | null, response: RewardResponse) => void) => void;
  CreateRewardTransactionWithClient: (request: CreateRewardTransactionRequest, callback: (error: Error | null, response: CreateRewardTransactionResponse) => void) => void;
  // Add other methods as needed
}

export interface Reward {
  rewardId: number;
  rewardName: string;
  rewardDescription: string;
  amount: number;
  currency: string;
  rate: number;
}

export interface RewardResponse {
  rewards: Reward[];
}

export interface CreateRewardTransactionRequest {
  userId: number;
  rewardId: number;
}

export interface CreateRewardTransactionResponse {
  rewardTransactionId: number;
}

// Location Service Types
export interface LocationServiceClient {
  GetAllActiveUserIds: (request: GetAllActiveUserIdsRequest, callback: (error: Error, response: GetAllActiveUserIdsResponse) => void) => void;
}

export type GetAllActiveUserIdsRequest = Record<string, never>;

export interface GetAllActiveUserIdsResponse {
  caches: Record<number, ArrayCacheDetails>;
}

export interface ArrayCacheDetails {
  locations: Record<number, ArrayLocationData>;
}

export interface ArrayLocationData {
  latitude: number;
  longitude: number;
  providerIds: string[];
}

// Call Management Service
export interface CallManagementServiceClient {
  GetConsumerCallHistory: (
    request: GetConsumerCallHistoryRequest,
    callback: (error: Error | null, response: GetConsumerCallHistoryResponse) => void
  ) => void;
  
  GetProviderCallHistory: (
    request: GetProviderCallHistoryRequest,
    callback: (error: Error | null, response: GetProviderCallHistoryResponse) => void
  ) => void;
}

export interface CallTransaction {
  callId: number;
  location: string;
  context: string;
  durationSeconds: number;
  charge: number;
  timestamp: {
    seconds: number;
    nanos: number;
  };
}

export interface GetConsumerCallHistoryRequest {
  consumerId: number;
}

export interface GetConsumerCallHistoryResponse {
  callHistory: CallTransaction[];
}

export interface GetProviderCallHistoryRequest {
  providerId: number;
}

export interface GetProviderCallHistoryResponse {
  callHistory: CallTransaction[];
}

// Helper interface to format protobuf timestamp
export interface UserTimestamp {
    seconds: string;
    nanos: number;
}