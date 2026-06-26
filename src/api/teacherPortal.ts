import { apiClient } from './client'
import type {
  TeacherDashboardResponse,
  TeacherDetailResponse,
  ChangePasswordPayload,
  WeeklyScheduleItem,
} from '@/types'

export const teacherPortalApi = {
  getMe: async (): Promise<TeacherDetailResponse> => {
    const { data } = await apiClient.get<{ data: TeacherDetailResponse }>('/teacher/me')
    return data.data ?? data
  },
  getDashboard: async (teacherId: number): Promise<TeacherDashboardResponse> => {
    const { data } = await apiClient.get<{ data: TeacherDashboardResponse }>(
      `/teacher/dashboard/${teacherId}`,
    )
    return data.data ?? data
  },
  getWeeklySchedule: async (teacherId: number): Promise<WeeklyScheduleItem[]> => {
    const { data } = await apiClient.get<{ data: WeeklyScheduleItem[] }>(
      `/teacher/schedule/${teacherId}`,
    )
    return data.data ?? data
  },
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.put('/teacher/change-password', payload)
  },
}
