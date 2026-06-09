import { apiClient } from './client'
import type { Course, CoursePayload, Paginated } from '@/types'

export const coursesApi = {
  list: async (params?: { search?: string; status?: string }): Promise<Paginated<Course>> => {
    const { data } = await apiClient.get<Paginated<Course>>('/courses', { params })
    return data
  },
  get: async (id: number): Promise<Course> => {
    const { data } = await apiClient.get<Course>(`/courses/${id}`)
    return data
  },
  create: async (payload: CoursePayload): Promise<Course> => {
    const { data } = await apiClient.post<{ data: Course }>('/courses', payload)
    return data.data
  },
  update: async (id: number, payload: Partial<CoursePayload>): Promise<Course> => {
    const { data } = await apiClient.put<{ data: Course }>(`/courses/${id}`, payload)
    return data.data
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}`)
  },
}
