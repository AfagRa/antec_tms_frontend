import { apiClient } from './client'
import type { ChangePasswordPayload } from '@/types'

export const usersApi = {
  changePassword: async (userId: number, payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.put(`/users/${userId}/password`, payload)
  },
  updateProfile: async (userId: number, payload: Record<string, unknown>): Promise<void> => {
    await apiClient.put(`/users/${userId}`, payload)
  },
}
