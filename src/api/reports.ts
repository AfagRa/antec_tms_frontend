import { apiClient } from './client'

export interface AttendanceReportDetail {
  studentId: number
  studentName: string | null
  present: number
  absent: number
  late: number
  excused: number
  attendancePercentage: number
}

export interface AttendanceReportResult {
  totalLessons: number
  totalRecords: number
  present: number
  absent: number
  late: number
  excused: number
  attendancePercentage: number
  details: AttendanceReportDetail[]
}

export interface GradesReportDetail {
  studentId: number
  studentName: string | null
  totalScore: number
  totalMaxScore: number
  percentage: number
  gradeCount: number
}

export interface GradesReportResult {
  totalRecords: number
  averageScore: number
  averageMaxScore: number
  overallPercentage: number
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
