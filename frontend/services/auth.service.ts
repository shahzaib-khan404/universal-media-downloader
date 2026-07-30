import { apiGet, apiPost } from '@/services/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', credentials);
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', credentials);
}

export async function logout(): Promise<void> {
  await apiPost('/auth/logout', {});
}

export async function getMe(): Promise<User> {
  return apiGet<User>('/auth/me');
}
