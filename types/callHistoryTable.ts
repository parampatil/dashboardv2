// types/callHistoryTable.ts
export interface FormattedCallTransactionDetails {
    callId: string;
    createdAt: string;
    sessionId: string;
    consumerId: string;
    providerId: string;
    sessionStartTimestamp: string | null;
    sessionEndTimestamp: string | null;
    providerJoinTimestamp: string | null;
    providerLeaveTimestamp: string | null;
    consumerJoinTimestamp: string | null;
    consumerLeaveTimestamp: string | null;
    callStatus: string;
    callUpdatedTimestamp: string;
    callDuration: string;
    context: string;
    location: string;
    charge: string;
    callDurationSeconds: string;
    chargeSeconds: string;
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
  