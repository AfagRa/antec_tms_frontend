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
  upload: async (
    lessonId: number,
    groupId: number,
    teacherId: number,
    title: string,
    type: string,
    file: File,
    description?: string,
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('lessonId', String(lessonId))
    formData.append('groupId', String(groupId))
    formData.append('teacherId', String(teacherId))
    formData.append('title', title)
    formData.append('type', type)
    formData.append('file', file)
    if (description) formData.append('description', description)
    await apiClient.post('/materials/upload', formData)
  },
  update: async (id: number, payload: Partial<CreateMaterialPayload>): Promise<void> => {
    await apiClient.put(`/materials/${id}`, payload)
  },
  updateWithFile: async (
    id: number,
    title: string,
    type: string,
    file?: File,
    description?: string,
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('type', type)
    if (file) formData.append('file', file)
    if (description) formData.append('description', description)
    await apiClient.put(`/materials/${id}/upload`, formData)
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/materials/${id}`)
  },
}
