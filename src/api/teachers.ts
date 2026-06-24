import { apiClient } from './client'
import type { Paginated, Teacher, TeacherPayload } from '@/types'

export const teachersApi = {
  list: async (params?: { search?: string; status?: string }): Promise<Paginated<Teacher>> => {
    const { data } = await apiClient.get<Paginated<Teacher>>('/teachers', { params })
    return data
  },
  get: async (id: number): Promise<Teacher> => {
    const { data } = await apiClient.get<Teacher>(`/teachers/${id}`)
    return data
  },
  create: async (payload: TeacherPayload): Promise<Teacher> => {
    const { data } = await apiClient.post<{ data: Teacher }>('/teachers', payload)
    return data.data
  },
  update: async (id: number, payload: Partial<TeacherPayload>): Promise<Teacher> => {
    const { data } = await apiClient.put<{ data: Teacher }>(`/teachers/${id}`, payload)
    return data.data
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`)
  },
  hardRemove: async (id: number): Promise<void> => {
    await apiClient.delete(`/teachers/${id}/hard`)
  },
}
