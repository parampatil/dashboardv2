// types/analytics.ts
export interface DailyCallStats {
    date: {
      seconds: number;
      nanos: number;
    };
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
  