import { apiClient } from './client'
import type { AttendanceRecord, Grade, Lesson, Material } from '@/types'

export const lessonsApi = {
  list: async (groupId?: number): Promise<Lesson[]> => {
    const { data } = await apiClient.get<Lesson[]>('/lessons', {
      params: groupId ? { group_id: groupId } : undefined,
    })
    return data
  },
  attendance: async (groupId: number): Promise<AttendanceRecord[]> => {
    const { data } = await apiClient.get<AttendanceRecord[]>('/attendance', {
      params: { group_id: groupId },
    })
    return data
  },
  grades: async (groupId: number): Promise<Grade[]> => {
    const { data } = await apiClient.get<Grade[]>('/grades', {
      params: { group_id: groupId },
    })
    return data
  },
  materials: async (groupId: number): Promise<Material[]> => {
    const { data } = await apiClient.get<Material[]>('/materials', {
      params: { group_id: groupId },
    })
    return data
  },
}