// app/api/grpc/services/user.ts
import { clients } from '../client';
import { promisify } from 'util';
import type { UserServiceClient } from '@/types/grpc';

const typedClient = clients.profile as unknown as UserServiceClient;

export const userService = {
  getUserDetails: promisify(typedClient.GetUserDetailsByUserId.bind(typedClient))
};
