// types/grpc.ts
import type { ServiceError } from '@grpc/grpc-js';

export interface GetTotalPageCountRequest {
  perPageEntries: number;
}

export interface GetTotalPageCountResponse {
  totalUserCount: number;
  totalPageCount: number;
}

export interface GetAllUsersRequest {
  pageSize: number;
  pageNumber: number;
}

export interface User {
  displayName: string;
  email: string;
  createdTimestamp: Date;
  country: string;
}

export interface GetAllUsersResponse {
  users: User[];
  totalCount: number;
}

export interface ProfileServiceClient {
  GetTotalPageCount(
    request: GetTotalPageCountRequest,
    callback: (error: ServiceError | null, response: GetTotalPageCountResponse) => void
  ): void;
  
  GetAllUsers(
    request: GetAllUsersRequest,
    callback: (error: ServiceError | null, response: GetAllUsersResponse) => void
  ): void;
}
