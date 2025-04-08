// Active user ids
export interface Provider {
    id: string;
    name: string;
  }
  
export interface LocationData {
  key: string;
  providers: Provider[];
  latitude: number;
  longitude: number;
}

export interface GetAllActiveUserIdsResponse {
  caches: Record<string, {
    locations: Record<string, {
      latitude: number;
      longitude: number;
      providers: Provider[];
    }>
  }>;
}
