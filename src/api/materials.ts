import { apiClient } from './client'
import type { Material, CreateMaterialPayload } from '@/types'

export const materialsApi = {
  getByGroup: async (groupId: number): Promise<Material[]> => {
    const { data } = await apiClient.get<{ data: Material[] }>(
      `/materials/group/${groupId}`,
    )
    return data.data ?? data
  },
  getByLesson: async (lessonId: number): Promise<Material[]> => {
    const { data } = await apiClient.get<{ data: Material[] }>(
      `/materials/lesson/${lessonId}`,
    )
    return data.data ?? data
  },
  create: async (payload: CreateMaterialPayload): Promise<void> => {
    await apiClient.post('/materials', payload)
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/materials/${id}`)
  },
}
