// Used for timestamp fields in user responses
export interface UserTimestamp {
    seconds: string;
    nanos: number;
  }
  
  // Main user details response from GetUserDetailsByUserId RPC
  export interface UserDetails {
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
    createdTimestamp: UserTimestamp;
    lastUpdatedTimestamp: UserTimestamp;
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
    userId: string;
    passwordHash: string;
    country: string;
  }
  
  // Response type for GetConsumerPurchaseBalance RPC
  export interface ConsumerBalance {
    consumerPurchaseBalance: number;
  }
  
  // Response type for GetProviderEarningBalance RPC
  export interface ProviderBalance {
    providerEarningBalance: number;
    currency: string;
  }
  
  // Combined type for user search results
  export interface UserSearchResult {
    user: UserDetails;
    consumerBalance: number;
    providerBalance: ProviderBalance;
  }