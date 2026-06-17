import { apiClient } from './client'
import type {
  MyDashboardResponse,
  MyLessonItem,
  MyAttendanceItem,
  MyGradeItem,
  MyMaterialDetail,
  MyProfileResponse,
  ChangePasswordPayload,
} from '@/types'

export const studentPortalApi = {
  getDashboard: async (): Promise<MyDashboardResponse> => {
    const { data } = await apiClient.get<{ data: MyDashboardResponse }>('/me/dashboard')
    return data.data ?? data
  },
  getLessons: async (): Promise<MyLessonItem[]> => {
    const { data } = await apiClient.get<{ data: MyLessonItem[] }>('/me/lessons')
    return data.data ?? data
  },
  getAttendance: async (): Promise<MyAttendanceItem[]> => {
    const { data } = await apiClient.get<{ data: MyAttendanceItem[] }>('/me/attendance')
    return data.data ?? data
  },
  getGrades: async (): Promise<MyGradeItem[]> => {
    const { data } = await apiClient.get<{ data: MyGradeItem[] }>('/me/grades')
    return data.data ?? data
  },
  getMaterials: async (): Promise<MyMaterialDetail[]> => {
    const { data } = await apiClient.get<{ data: MyMaterialDetail[] }>('/me/materials')
    return data.data ?? data
  },
  getProfile: async (): Promise<MyProfileResponse> => {
    const { data } = await apiClient.get<{ data: MyProfileResponse }>('/me/profile')
    return data.data ?? data
  },
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.put('/me/change-password', payload)
  },
}
