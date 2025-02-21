// app/api/grpc/services/profile.ts
import client from '../client';
import { promisify } from 'util';
import type { ProfileServiceClient } from '@/types/grpc';

// Cast the client to the correct type
const typedClient = client as unknown as ProfileServiceClient;

export const profileService = {
  getTotalPageCount: promisify(typedClient.GetTotalPageCount.bind(typedClient)),
  getAllUsers: promisify(typedClient.GetAllUsers.bind(typedClient))
};
