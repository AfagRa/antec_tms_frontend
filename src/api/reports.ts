import { apiClient } from './client'
import type { AttendanceReportResult, GradesReportResult } from '@/types'

export const reportsApi = {
  attendance: async (
    groupId: number,
    from?: string,
    to?: string,
  ): Promise<AttendanceReportResult> => {
    const { data } = await apiClient.get<{ data: AttendanceReportResult }>(
      `/reports/attendance/${groupId}`,
      { params: { from, to } },
    )
    return data.data ?? data
  },
  grades: async (
    groupId: number,
    from?: string,
    to?: string,
  ): Promise<GradesReportResult> => {
    const { data } = await apiClient.get<{ data: GradesReportResult }>(
      `/reports/grades/${groupId}`,
      { params: { from, to } },
    )
    return data.data ?? data
  },
}
