import { apiClient } from './client'

export interface AttendanceReportDetail {
  student_id: number
  student_name: string | null
  present: number
  absent: number
  late: number
  excused: number
  attendance_percentage: number
}

export interface AttendanceReportResult {
  total_lessons: number
  total_records: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_percentage: number
  details: AttendanceReportDetail[]
}

export interface GradesReportDetail {
  student_id: number
  student_name: string | null
  total_score: number
  total_max_score: number
  percentage: number
  grade_count: number
}

export interface GradesReportResult {
  total_records: number
  average_score: number
  average_max_score: number
  overall_percentage: number
  details: GradesReportDetail[]
}

export const reportsApi = {
  attendance: async (groupId: number): Promise<AttendanceReportResult> => {
    const { data } = await apiClient.get<{ data: AttendanceReportResult }>(
      `/reports/attendance/${groupId}`,
    )
    return data.data ?? data
  },
  grades: async (groupId: number): Promise<GradesReportResult> => {
    const { data } = await apiClient.get<{ data: GradesReportResult }>(
      `/reports/grades/${groupId}`,
    )
    return data.data ?? data
  },
}
