import { apiClient } from './client'
import type { AuthResponse, ChangePasswordPayload, User } from '@/types'

export const authApi = {
  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.put('/auth/change-password', payload)
  },
}
