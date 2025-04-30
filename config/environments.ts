// config/environments.ts
export const environments = {
  dev: {
    name: "Development",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "api.360world.com:32394",
      CONSUMER_PURCHASE: "api.360world.com:31451",
      PROVIDER_EARNING: "api.360world.com:31060",
      REWARD: "api.360world.com:32064",
      LOCATION: "api.360world.com:32461",
      CALL_MANAGEMENT: "api.360world.com:30111",
      MPSQUARE: "api.360world.com:32545",
      DENY_LIST: "deny-list.stg.360world.com:443",
    },
    bearerToken: process.env.MPSQUARE_BEARER_TOKEN,
  },
  preprod: {
    name: "Pre-Production",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "api.360world.com:32394",
      CONSUMER_PURCHASE: "api.360world.com:31451",
      PROVIDER_EARNING: "api.360world.com:31060",
      REWARD: "api.360world.com:32064",
      LOCATION: "api.360world.com:32461",
      CALL_MANAGEMENT: "api.360world.com:30111",
      MPSQUARE: "api.360world.com:32545",
      DENY_LIST: "deny-list.stg.360world.com:443",
    },
    bearerToken: process.env.MPSQUARE_BEARER_TOKEN,
  },
  prod: {
    name: "Production",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "profile-service.stg.360world.com:443",
      CONSUMER_PURCHASE: "consumer-purchase-service.stg.360world.com:443",
      PROVIDER_EARNING: "provider-earning-service.stg.360world.com:443",
      REWARD: "rewards-service.stg.360world.com:443",
      LOCATION: "las-service.stg.360world.com:443",
      CALL_MANAGEMENT: "call-management-service.stg.360world.com:443",
      MPSQUARE:  "mp-square.stg.360world.com:443",
      DENY_LIST: "deny-list.stg.360world.com:443",
    },
    bearerToken: process.env.MPSQUARE_BEARER_TOKEN,
  },
};

export const defaultEnvironment =  {
  prod: {
    name: "Default (Prod)",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "api.360world.com:32394",
      CONSUMER_PURCHASE: "api.360world.com:31451",
      PROVIDER_EARNING: "api.360world.com:31060",
      REWARD: "api.360world.com:32064",
      LOCATION: "api.360world.com:32461",
      CALL_MANAGEMENT: "api.360world.com:30111",
      MPSQUARE: "api.360world.com:32545",
      DENY_LIST: "deny-list.stg.360world.com:443",
    },
  },
}

export const environmentsList = {
  dev: "Development",
  preprod: "Pre-Production",
  prod: "Production",
};
