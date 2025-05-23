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
  GetAllUserIdsAndNamesDashboard: (
    request: GetAllUserIdsAndNamesDashboardResponseRequest,
    callback: (
      error: Error | null,
      response: GetAllUserIdsAndNamesDashboardResponse
    ) => void
  ) => void;
  UpdateUserDetails: (
    request: UpdateUserDetailsRequest,
    callback: (error: Error | null, response: UpdateUserDetailsResponse) => void
  ) => void;
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

  // optional fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  pin?: string;
  bio?: string;
  proximityAsSkill?: string;
  updatedBy?: string;
  isActive?: boolean;
  deleted?: boolean;
}

export interface UserIdNameMapping {
  [userId: string]: string;
}

export type GetAllUserIdsAndNamesDashboardResponseRequest = object;

export interface GetAllUserIdsAndNamesDashboardResponse {
  userIdsAndNames: UserIdNameMapping;
}

export interface UpdateUserDetailsRequest {
  userId: number;
  userName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  displayName?: string;
  phoneNumber?: string;
  email?: string;
  pin?: string;
  bio?: string;
  userType?: string;
  proximityAsSkill?: string;
  updatedBy?: string;
  isActive?: boolean;
  country?: string;
}

export interface UpdateUserDetailsResponse {
  success: boolean;
  message: string;
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
    request: GetConsumerPurchaseBalanceRequest,
    callback: (
      error: Error | null,
      response: GetConsumerPurchaseBalanceResponse
    ) => void
  ) => void;
  GetConsumerPurchaseHistory: (
    request: ConsumerPurchaseHistoryRequest,
    callback: (
      error: Error | null,
      response: ConsumerPurchaseHistoryResponse
    ) => void
  ) => void;
  GetTotalConsumerPurchaseAmount: (
    request: GetTotalConsumerPurchaseAmountRequest,
    callback: (
      error: Error | null,
      response: GetTotalConsumerPurchaseAmountResponse
    ) => void
  ) => void;
  // Add other methods as needed
}

export interface GetConsumerPurchaseBalanceRequest {
  userId: string;
}

export interface GetConsumerPurchaseBalanceResponse {
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

// Consumer Purchase Analytics
export interface GetTotalConsumerPurchaseAmountRequest {
  startDate: ProtoTimestamp;
  endDate: ProtoTimestamp;
}

export interface GetTotalConsumerPurchaseAmountResponse {
  totalPurchaseAmount: number;
}

// Provider Earning Service Types
export interface ProviderEarningServiceClient extends grpc.Client {
  GetProviderEarningBalance: (
    request: GetProviderEarningBalanceRequest,
    callback: (
      error: Error | null,
      response: GetProviderEarningBalanceResponse
    ) => void
  ) => void;
  GetProviderEarningTransactions: (
    request: ProviderEarningTransactionsRequest,
    callback: (
      error: Error | null,
      response: ProviderEarningTransactionsResponse
    ) => void
  ) => void;
  GetAllProviderAnalytics: (
    request: GetAllProviderAnalyticsRequest,
    callback: (
      error: Error | null,
      response: GetAllProviderAnalyticsResponse
    ) => void
  ) => void;
  // Add other methods as needed
}

export interface GetProviderEarningBalanceRequest {
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

// Provider Analytics
export interface GetAllProviderAnalyticsRequest {
  startDate: ProtoTimestamp;
  endDate: ProtoTimestamp;
}

export interface GetAllProviderAnalyticsResponse {
  totalEarning: number;
  totalPayout: number;
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
  GetAllActiveUserIds: (
    request: GetAllActiveUserIdsRequest,
    callback: (
      error: Error | null,
      response: GetAllActiveUserIdsResponse
    ) => void
  ) => void;
  GetAllPriorityList: (
    request: GetAllPriorityListRequest,
    callback: (
      error: Error | null,
      response: GetAllPriorityListResponse
    ) => void
  ) => void;
  UpdateUserPriorityPositive: (
    request: UpdateUserPriorityPositiveRequest,
    callback: (
      error: Error | null,
      response: UpdateUserPriorityPositiveResponse
    ) => void
  ) => void;

  UpdateUserPriorityNegative: (
    request: UpdateUserPriorityNegativeRequest,
    callback: (
      error: Error | null,
      response: UpdateUserPriorityNegativeResponse
    ) => void
  ) => void;
  GetAllBlacklistedUsers: (
    request: GetAllBlacklistedUsersRequest,
    callback: (
      error: Error | null,
      response: GetAllBlacklistedUsersResponse
    ) => void
  ) => void;
  BlacklistUser: (
    request: BlacklistUserRequest,
    callback: (error: Error | null, response: BlacklistUserResponse) => void
  ) => void;
  UnblacklistUser: (
    request: UnblacklistUserRequest,
    callback: (error: Error | null, response: UnblacklistUserResponse) => void
  ) => void;
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

export type GetAllPriorityListRequest = object;

export interface GetAllPriorityListResponse {
  priorityList: { [key: string]: string };
}

export interface UpdateUserPriorityPositiveRequest {
  userId: number;
}

export interface UpdateUserPriorityPositiveResponse {
  message: string;
}

export interface UpdateUserPriorityNegativeRequest {
  userId: number;
}

export interface UpdateUserPriorityNegativeResponse {
  message: string;
}

export type GetAllBlacklistedUsersRequest = object;

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

  GetUserCallAnalytics: (
    request: GetUserCallAnalyticsRequest,
    callback: (
      error: Error | null,
      response: GetUserCallAnalyticsResponse
    ) => void
  ) => void;

  GetTotalCallsPageCount: (
    request: GetTotalCallsPageCountRequest,
    callback: (
      error: Error | null,
      response: GetTotalCallsPageCountResponse
    ) => void
  ) => void;

  GetCallDetails: (
    request: GetCallDetailsRequest,
    callback: (error: Error | null, response: GetCallDetailsResponse) => void
  ) => void;

  GetCallTestAnalytics: (
    request: GetCallTestAnalyticsRequest,
    callback: (error: Error | null, response: GetCallTestAnalyticsResponse) => void
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

// User Call Analytics
export interface GetUserCallAnalyticsRequest {
  userId: string | number;
  startTimestamp: ProtoTimestamp;
  endTimestamp: ProtoTimestamp;
}

export interface DailyCallStats {
  date: ProtoTimestamp;
  totalCallTime: string | number;
  averageCallTime: string | number;
}

export interface GetUserCallAnalyticsResponse {
  totalCalls: string | number;
  totalCallTime: string | number;
  averageCallTime: number;
  medianCallTime: number;
  callStatsPerDay: DailyCallStats[];
}

// Call History table
export interface GetTotalCallsPageCountRequest {
  callStatuses?: string[];
  userId?: string;
  fromDate?: ProtoTimestamp;
  toDate?: ProtoTimestamp;
  isConsumer?: boolean;
  isProvider?: boolean;
  perPageEntries: number;
}

export interface GetTotalCallsPageCountResponse {
  totalCallCount: string;
  totalPageCount: string;
}

export interface GetCallDetailsRequest {
  userId: string;
  sortOrder: "asc" | "desc";
  pageNumber: number;
  pageSize: number;
  callStatuses: string[];
  fromDate: ProtoTimestamp;
  toDate: ProtoTimestamp;
  isConsumer: boolean;
  isProvider: boolean;
}

export interface CallTransactionDetails {
  callId: string;
  createdAt: ProtoTimestamp;
  sessionId: string;
  consumerId: string;
  providerId: string;
  sessionStartTimestamp: ProtoTimestamp;
  sessionEndTimestamp: ProtoTimestamp;
  providerJoinTimestamp: ProtoTimestamp;
  providerLeaveTimestamp: ProtoTimestamp;
  consumerJoinTimestamp: ProtoTimestamp;
  consumerLeaveTimestamp: ProtoTimestamp;
  callStatus: string;
  callUpdatedTimestamp: ProtoTimestamp;
  callDuration: string;
  context: string;
  location: string;
  charge: string;
}

export interface GetCallDetailsResponse {
  callDetails: CallTransactionDetails[];
  totalRecords: string;
  pageNumber: number;
  pageSize: number;
}

export interface GetCallTestAnalyticsRequest {
  date: ProtoTimestamp;
}

export interface callTestAnalyticsUser {
  userId: string;
  userName: string;
  callTimeConsumer: number;
  callTimeProvider: number;
}

export interface GetCallTestAnalyticsResponse {
  testAnalytics: callTestAnalyticsUser[];
}

// MP2 Service Types
export interface MPSquareServiceClient {
  SetUserJailTime: (
    request: SetUserJailTimeRequest,
    callback: (error: Error | null, response: SetUserJailTimeResponse) => void
  ) => void;
  GetIncarceratedUsers: (
    request: GetIncarceratedUsersRequest,
    callback: (
      error: Error | null,
      response: GetIncarceratedUsersResponse
    ) => void
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

export type GetIncarceratedUsersRequest = object;

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

// Denylist Service Types
export interface DenyListServiceClient extends grpc.Client {
  InsertGeohash: (
    request: GeohashList,
    callback: (error: Error | null, response: Response) => void
  ) => void;
  DeleteGeohash: (
    request: GeohashList,
    callback: (error: Error | null, response: Response) => void
  ) => void;
  GetGeohash: (
    request: Empty,
    callback: (error: Error | null, response: GeohashList) => void
  ) => void;
}

export interface GeohashList {
  geohashes: string[];
}

export interface GeohashRequest {
  geohash: string;
}

export interface Response {
  message: string;
  success: boolean;
}

export type Empty = Record<string, never>;

// One Guard Service types
export interface OneGuardServiceClient extends grpc.Client {
  GetActiveUsers: (
    request: GetActiveUsersRequest,
    callback: (error: Error | null, response: GetActiveUsersResponse) => void
  ) => void;
  RevokeSession: (
    request: RevokeSessionRequest,
    callback: (error: Error | null, response: RevokeSessionResponse) => void
  ) => void;
}

export interface ActiveUser {
  user_id: number;
  username: string;
  status: string;
}

export type GetActiveUsersRequest = object;

export interface GetActiveUsersResponse {
  users: ActiveUser[];
}

export interface RevokeSessionRequest {
  user_id: number;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
}

// AuthService types
export interface AuthServiceClient extends grpc.Client {
  SoftDeleteUser: (
    request: SoftDeleteUserRequest,
    callback: (error: Error | null, response: SoftDeleteUserResponse) => void
  ) => void;
}

export interface SoftDeleteUserRequest {
  user_id: string;
}

export interface SoftDeleteUserResponse {
  success: boolean;
  message: string;
}

// Helper interface to format protobuf timestamp
export interface ProtoTimestamp {
  seconds: string;
  nanos: number;
}
