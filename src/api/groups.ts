import { apiClient } from './client'
import type { Group, GroupPayload, Paginated, ScheduleRow } from '@/types'

export const groupsApi = {
  list: async (params?: { course_id?: number; teacher_id?: number; status?: string }): Promise<Paginated<Group>> => {
    const { data } = await apiClient.get<Paginated<Group>>('/groups', { params })
    return data
  },
  get: async (id: number): Promise<Group> => {
    const { data } = await apiClient.get<Group>(`/groups/${id}`)
    return data
  },
  create: async (payload: GroupPayload): Promise<Group> => {
    try {
      const { data } = await apiClient.post<{ data: Group }>('/groups', payload)
      return data.data
    } catch (error: any) {
      console.error('createGroup failed:', error?.response?.data ?? error.message)
      throw error
    }
  },
  update: async (id: number, payload: Partial<GroupPayload>): Promise<Group> => {
    try {
      const { data } = await apiClient.put<{ data: Group }>(`/groups/${id}`, payload)
      return data.data
    } catch (error: any) {
      console.error('updateGroup failed:', error?.response?.data ?? error.message)
      throw error
    }
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/groups/${id}`)
  },
  addStudent: async (groupId: number, studentId: number): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/students`, { student_id: studentId })
  },
  removeStudent: async (groupId: number, studentId: number): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/students/${studentId}`)
  },
  getGroupSchedule: async (groupId: number): Promise<ScheduleRow[]> => {
    const { data } = await apiClient.get<{ data: ScheduleRow[] }>(`/groups/${groupId}/schedule`)
    return data.data ?? data
  },
}
