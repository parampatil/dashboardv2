import { ProtoTimestamp } from "./grpc";

// types/callHistoryTable.ts
export interface FormattedCallTransactionDetails {
  callId: string;
  sessionId: string;
  consumerId: string;
  providerId: string;
  consumerName?: string; // Added consumer name
  providerName?: string; // Added provider name
  createdAt: ProtoTimestamp;
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
  // callDurationSeconds: string;
  // chargeSeconds: string;
}

  
  export interface CallHistoryTableFilters {
    userId: number;
    sortOrder: "asc" | "desc";
    pageNumber: number;
    pageSize: number;
    callStatuses: string[];
    fromDate: Date;
    toDate: Date;
    isConsumer: boolean;
    isProvider: boolean;
  }
  
  export interface FormattedCallDetailsResponse {
    callDetails: FormattedCallTransactionDetails[];
    totalRecords: string;
    pageNumber: number;
    pageSize: number;
  }
  