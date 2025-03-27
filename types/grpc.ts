// types/grpc.ts
import * as grpc from "@grpc/grpc-js";

// Profile Service Types
export interface ProfileServiceClient extends grpc.Client {
  GetUserDetailsByEmail: (
    request: GetUserDetailsByEmailRequest,
    callback: (
      error: Error | null,
      response: GetUserDetailsByEmailResponse
    ) => void
  ) => void;
  GetAllUsers: (
    request: UsersRequest,
    callback: (error: Error | null, response: UsersResponse) => void
  ) => void;
  GetUserDetailsByUserId: (
    request: UserDetailsRequest,
    callback: (error: Error | null, response: UserDetailsResponse) => void
  ) => void;
  GetTotalPageCount: (
    request: PageCountRequest,
    callback: (error: Error | null, response: PageCountResponse) => void
  ) => void;
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
  createdTimestamp: ProtoTimestamp;
  lastUpdatedTimestamp: ProtoTimestamp;
  phoneNumber?: string;
  userName: string;
}

// Consumer Purchase Service Types
export interface ConsumerPurchaseServiceClient extends grpc.Client {
  AvailableOffers: (
    request: AvailableOffersRequest,
    callback: (error: Error | null, response: AvailableOffersResponse) => void
  ) => void;
  CreateOffer: (
    request: CreateOfferRequest,
    callback: (error: Error | null, response: CreateOfferResponse) => void
  ) => void;
  GetConsumerPurchaseBalance: (
    request: GetConsumerPurchaseBalanceRequest ,
    callback: (error: Error | null, response: GetConsumerPurchaseBalanceResponse ) => void
  ) => void;
  GetConsumerPurchaseHistory: (
    request: ConsumerPurchaseHistoryRequest,
    callback: (
      error: Error | null,
      response: ConsumerPurchaseHistoryResponse
    ) => void
  ) => void;
  // Add other methods as needed
}

export interface GetConsumerPurchaseBalanceRequest  {
  userId: string;
}

export interface GetConsumerPurchaseBalanceResponse  {
  consumerPurchaseBalance: number;
}

export enum TransactionStatus {
  SUCCESS = "transaction_success",
  IN_PROGRESS = "transaction_in_progress",
  FAILED = "transaction_failed",
  REWARD = "transaction_reward",
}

export enum RefundStatus {
  SUCCESS = "refund_success",
  IN_PROGRESS = "refund_in_progress",
  UNAVAILABLE = "refund_unavailable",
  AVAILABLE = "refund_available",
}

export interface ConsumerPurchaseTransaction {
  transactionId: number;
  offerName: string;
  totalMinutes: number;
  totalUnusedMinutes: number;
  totalRefundAmount: number;
  purchaseTimestamp: ProtoTimestamp;
  purchaseAmount: number;
  purchaseCurrency: string;
  transactionStatus: TransactionStatus;
  refundStatus: RefundStatus;
}

export interface ConsumerPurchaseHistoryRequest {
  userId: string;
}

export interface ConsumerPurchaseHistoryResponse {
  consumerPurchaseHistory: ConsumerPurchaseTransaction[];
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
  offerName: string;
  numberOfMinutes: number;
  totalPrice: number;
  currency: string;
  country: string;
}

export interface CreateOfferResponse {
  offerId: number;
}

// Provider Earning Service Types
export interface ProviderEarningServiceClient extends grpc.Client {
  GetProviderEarningBalance: (
    request: GetProviderEarningBalanceRequest ,
    callback: (error: Error | null, response: GetProviderEarningBalanceResponse ) => void
  ) => void;
  GetProviderEarningTransactions: (
    request: ProviderEarningTransactionsRequest,
    callback: (
      error: Error | null,
      response: ProviderEarningTransactionsResponse
    ) => void
  ) => void;
  // Add other methods as needed
}

export interface GetProviderEarningBalanceRequest  {
  userId: string;
}

export interface GetProviderEarningBalanceResponse {
  providerEarningBalance: number;
  currency: string;
}

export enum ProviderEarningTransactionType {
  CREDIT = "credit",
  PAYOUT = "payout",
}

export enum ProviderEarningPayoutStatus {
  CREATED = "created",
  PENDING = "pending",
  IN_TRANSIT = "in_transit",
  PAID = "paid",
  FAILED = "failed",
  CANCELED = "canceled",
}


export interface ProviderEarningTransaction {
  transactionId: number;
  transactionTimestamp: ProtoTimestamp;
  callDuration: number;
  rate: number;
  currency: string;
  amount: number;
  transactionType: ProviderEarningTransactionType;
  status: ProviderEarningPayoutStatus;
}

export interface ProviderEarningTransactionsRequest {
  userId: string;
}

export interface ProviderEarningTransactionsResponse {
  providerTransactionHistory: ProviderEarningTransaction[];
}

// Reward Service Types
export interface RewardServiceClient extends grpc.Client {
  getAvailableRewards: (
    request: Record<string, never>,
    callback: (error: Error | null, response: RewardResponse) => void
  ) => void;
  CreateRewardTransactionWithClient: (
    request: CreateRewardTransactionRequest,
    callback: (
      error: Error | null,
      response: CreateRewardTransactionResponse
    ) => void
  ) => void;
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
  GetAllActiveUserIds: (request: GetAllActiveUserIdsRequest, callback: (error: Error | null, response: GetAllActiveUserIdsResponse) => void) => void;
  GetAllPriorityList: (request: GetAllPriorityListRequest, callback: (error: Error | null, response: GetAllPriorityListResponse) => void) => void;
  GetAllBlacklistedUsers: (request: GetAllBlacklistedUsersRequest, callback: (error: Error | null, response: GetAllBlacklistedUsersResponse) => void) => void;
  BlacklistUser: (request: BlacklistUserRequest, callback: (error: Error | null, response: BlacklistUserResponse) => void) => void;
  UnblacklistUser: (request: UnblacklistUserRequest, callback: (error: Error | null, response: UnblacklistUserResponse) => void) => void;
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

export type GetAllPriorityListRequest = object

export interface GetAllPriorityListResponse {
  priorityList: { [key: string]: string };
}

export type GetAllBlacklistedUsersRequest = object

export interface GetAllBlacklistedUsersResponse {
  blacklistedUsers: string[];
}

export interface BlacklistUserRequest {
  userId: string;
}

export interface BlacklistUserResponse {
  success: boolean;
}

export interface UnblacklistUserRequest {
  userId: string;
}

export interface UnblacklistUserResponse {
  success: boolean;
}

// Call Management Service
export interface CallManagementServiceClient {
  GetConsumerCallHistory: (
    request: GetConsumerCallHistoryRequest,
    callback: (
      error: Error | null,
      response: GetConsumerCallHistoryResponse
    ) => void
  ) => void;

  GetProviderCallHistory: (
    request: GetProviderCallHistoryRequest,
    callback: (
      error: Error | null,
      response: GetProviderCallHistoryResponse
    ) => void
  ) => void;

  GetAllUsersCallTime: (
    request: GetAllUsersCallTimeRequest,
    callback: (
      error: Error | null,
      response: GetAllUsersCallTimeResponse
    ) => void
  ) => void;
}

// Consumer Call History
export interface ConsumerCallHistory {
  callId: string;
  location: string;
  context: string;
  durationSeconds: string;
  charge: string; // in seconds, will be converted to minutes
  timestamp: { seconds?: string; nanos?: number };
}

export interface GetConsumerCallHistoryRequest {
  consumerId: string;
}

export interface GetConsumerCallHistoryResponse {
  callHistory: ConsumerCallHistory[];
}

// Provider Call History
export interface ProviderCallHistory {
  callId: string;
  location: string;
  context: string;
  durationSeconds: string;
  charge: string; // in cents, will be converted to dollars
  timestamp: { seconds?: string; nanos?: number };
}

export interface GetProviderCallHistoryRequest {
  providerId: string;
}

export interface GetProviderCallHistoryResponse {
  callHistory: ProviderCallHistory[];
}

export interface GetAllUsersCallTimeRequest {
  startTime: {
    seconds: number;
    nanos: number;
  };
  endTime: {
    seconds: number;
    nanos: number;
  };
}

export interface UserCallTime {
  userId: number;
  userName: string;
  numberOfCalls: number;
  totalCallTime: number;
  callTimeAsProvider: number;
  callTimeAsConsumer: number;
}

export interface GetAllUsersCallTimeResponse {
  userCallTime: UserCallTime[];
}


// MP2 Service Types
export interface MPSquareServiceClient {
  SetUserJailTime: (
    request: SetUserJailTimeRequest,
    callback: (error: Error | null, response: SetUserJailTimeResponse) => void
  ) => void;
  GetIncarceratedUsers: (
    request: GetIncarceratedUsersRequest,
    callback: (error: Error | null, response: GetIncarceratedUsersResponse) => void
  ) => void;
  JailbreakUser: (
    request: JailbreakUserRequest,
    callback: (error: Error | null, response: JailbreakUserResponse) => void
  ) => void;
  CheckUserStatus: (
    request: CheckUserStatusRequest,
    callback: (error: Error | null, response: CheckUserStatusResponse) => void
  ) => void;
}

export interface IncarceratedUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  jail_time_end: string;
}

export interface SetUserJailTimeRequest {
  user_id: number;
  jail_time_seconds: number;
}

export interface SetUserJailTimeResponse {
  success: boolean;
  message: string;
  jail_time_remaining: number;
}

export type GetIncarceratedUsersRequest = object

export interface GetIncarceratedUsersResponse {
  users: IncarceratedUser[];
}

export interface JailbreakUserRequest {
  user_id: number;
}

export interface JailbreakUserResponse {
  success: boolean;
  message: string;
}

export interface CheckUserStatusRequest {
  user_id: number;
}

export interface CheckUserStatusResponse {
  is_in_jail: boolean;
  jail_time_remaining: number;
  message: string;
}


// Helper interface to format protobuf timestamp
export interface ProtoTimestamp {
  seconds: string;
  nanos: number;
}
