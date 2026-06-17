import { apiClient } from './client'
import type {
  GroupLessonItem,
  CreateLessonPayload,
  LessonAttendanceItem,
  LessonGradeItem,
  CreateAttendancePayload,
  CreateGradePayload,
} from '@/types'

export interface LessonDetail {
  id: number
  group_id: number
  group_name: string | null
  teacher_id: number
  teacher_name: string | null
  lesson_date: string
  topic: string
  note: string | null
  status: string
}

export const lessonsApi = {
  getById: async (id: number): Promise<LessonDetail> => {
    const { data } = await apiClient.get<{ data: LessonDetail }>(`/lessons/${id}`)
    return data.data ?? data
  },
  getByGroup: async (groupId: number): Promise<GroupLessonItem[]> => {
    const { data } = await apiClient.get<{ data: GroupLessonItem[] }>(
      `/lessons/group/${groupId}`,
    )
    return data.data ?? data
  },
  create: async (payload: CreateLessonPayload): Promise<void> => {
    await apiClient.post('/lessons', payload)
  },
  getAttendances: async (lessonId: number): Promise<LessonAttendanceItem[]> => {
    const { data } = await apiClient.get<{ data: LessonAttendanceItem[] }>(
      `/lessons/${lessonId}/attendances`,
    )
    return data.data ?? data
  },
  createAttendance: async (
    lessonId: number,
    payload: CreateAttendancePayload,
  ): Promise<void> => {
    await apiClient.post(`/lessons/${lessonId}/attendances`, payload)
  },
  updateAttendance: async (
    attendanceId: number,
    payload: Partial<CreateAttendancePayload>,
  ): Promise<void> => {
    await apiClient.put(`/lessons/attendances/${attendanceId}`, payload)
  },
  getGrades: async (lessonId: number): Promise<LessonGradeItem[]> => {
    const { data } = await apiClient.get<{ data: LessonGradeItem[] }>(
      `/lessons/${lessonId}/grades`,
    )
    return data.data ?? data
  },
  createGrade: async (lessonId: number, payload: CreateGradePayload): Promise<void> => {
    await apiClient.post(`/lessons/${lessonId}/grades`, payload)
  },
  updateGrade: async (
    gradeId: number,
    payload: Partial<CreateGradePayload>,
  ): Promise<void> => {
    await apiClient.put(`/lessons/grades/${gradeId}`, payload)
  },
}
