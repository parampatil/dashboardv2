// hooks/useApi.ts
"use client";
import { useEnvironment } from "@/context/EnvironmentContext";

export function useApi() {
  const { currentEnvironment } = useEnvironment();
  
  const fetchWithEnvironment = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set('x-environment', currentEnvironment);
    
    return fetch(url, {
      ...options,
      headers
    });
  };
  
  return { fetch: fetchWithEnvironment };
}
