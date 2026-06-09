import { apiClient } from './client'
import type { Paginated, Student, StudentPayload } from '@/types'

export const studentsApi = {
  list: async (params?: { group_id?: number; status?: string; search?: string }): Promise<Paginated<Student>> => {
    const { data } = await apiClient.get<Paginated<Student>>('/students', { params })
    return data
  },
  get: async (id: number): Promise<Student> => {
    const { data } = await apiClient.get<Student>(`/students/${id}`)
    return data
  },
  create: async (payload: StudentPayload): Promise<Student> => {
    const { data } = await apiClient.post<{ data: Student }>('/students', payload)
    return data.data
  },
  update: async (id: number, payload: Partial<StudentPayload>): Promise<Student> => {
    const { data } = await apiClient.put<{ data: Student }>(`/students/${id}`, payload)
    return data.data
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`)
  },
}
