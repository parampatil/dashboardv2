// types/analytics.ts
import { ProtoTimestamp } from '@/types/grpc';
export interface DailyCallStats {
    date: ProtoTimestamp;
    totalCallTime: number;
    averageCallTime: number;
  }
  
  export interface UserCallAnalytics {
    totalCalls: number;
    totalCallTime: number;
    averageCallTime: number;
    callStatsPerDay: DailyCallStats[];
  }
  
  export interface ConsumerPurchaseAnalytics {
    totalPurchaseAmount: number;
  }
  
  export interface ProviderAnalytics {
    totalEarning: number;
    totalPayout: number;
  }