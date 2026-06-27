import { apiClient } from './client'
import type {
  MyDashboardResponse,
  MyLessonItem,
  MyProfileResponse,
  ChangePasswordPayload,
} from '@/types'

interface AttendanceJournalItem {
  id: number
  student_id: number
  student_name: string
  status: string
  minutes_late: number | null
  reason: string | null
  teacher_note: string | null
  created_at: string
}

interface AttendanceJournalResponse {
  items: AttendanceJournalItem[]
  present_count: number
  excused_count: number
  absent_count: number
  late_count: number
  percentage: number
}

export const studentPortalApi = {
  getDashboard: async (): Promise<MyDashboardResponse> => {
    const { data } = await apiClient.get<{ data: MyDashboardResponse }>('/me/dashboard')
    return data.data ?? data
  },
  getLessons: async (): Promise<MyLessonItem[]> => {
    const { data } = await apiClient.get<{ data: MyLessonItem[] }>('/me/lessons')
    return data.data ?? data
  },
  getMyGroups: async (): Promise<Array<{ id: number; name: string; lessonCount: number; averageGrade: number; status: string }>> => {
    const { data } = await apiClient.get<{ data: Array<{ id: number; name: string; lessonCount: number; averageGrade: number; status: string }> }>('/me/my-groups')
    return data.data ?? data
  },
  getAttendanceJournal: async (): Promise<AttendanceJournalResponse> => {
    const { data } = await apiClient.get<{ data: AttendanceJournalResponse }>('/me/attendance-journal')
    return data.data ?? data
  },
  getMyGrades: async () => {
    const { data } = await apiClient.get('/me/dashboard')
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
