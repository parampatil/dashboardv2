// config/environments.ts
export const environments = {
  dev: {
    name: "Development",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "api.360world.com:32394",
      CONSUMER_PURCHASE: "api.360world.com:31128",
      PROVIDER_EARNING: "api.360world.com:30116",
      REWARD: "api.360world.com:32064",
      LOCATION: "api.360world.com:32461",
    },
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
    },
  },
  prod: {
    name: "Production",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "api.360world.com:32394",
      CONSUMER_PURCHASE: "api.360world.com:31451",
      PROVIDER_EARNING: "api.360world.com:31060",
      REWARD: "api.360world.com:32064",
      LOCATION: "api.360world.com:32461",
    },
  },
};

export const defaultEnvironment =  {
  // dev: {
  //   name: "Default (Dev)",
  //   apiBaseUrl: "https://api.360world.com",
  //   serviceUrls: {
  //     PROFILE: "api.360world.com:32394",
  //     CONSUMER_PURCHASE: "api.360world.com:31128",
  //     PROVIDER_EARNING: "api.360world.com:30116",
  //     REWARD: "api.360world.com:32064",
  //   },
  // },
  prod: {
    name: "Default (Prod)",
    apiBaseUrl: "https://api.360world.com",
    serviceUrls: {
      PROFILE: "api.360world.com:32394",
      CONSUMER_PURCHASE: "api.360world.com:31451",
      PROVIDER_EARNING: "api.360world.com:31060",
      REWARD: "api.360world.com:32064",
      LOCATION: "api.360world.com:32461",
    },
  },
}

export const environmentsList = {
  dev: "Development",
  preprod: "Pre-Production",
  prod: "Production",
};
