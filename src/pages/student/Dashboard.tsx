import { ExternalLink } from 'lucide-react'
import NeuStatCard from '../../components/ui/NeuStatCard'
import { MaterialTypeBadge } from '../../components/ui/MaterialTypeBadge'
import type { MaterialTypeName } from '../../types'
import {
  useAcademic,
  getStudentDashboardStats,
  getStudentGrades,
  getStudentAttendance,
  getStudentMaterials,
} from '../../store/academicStore'

const MOCK_STUDENT_ID = 's1'

export default function StudentDashboard() {
  const { state } = useAcademic()

  const stats = getStudentDashboardStats(state, MOCK_STUDENT_ID)
  const rawGrades = getStudentGrades(state, MOCK_STUDENT_ID)
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))
    .slice(0, 5)
  const rawMaterials = getStudentMaterials(MOCK_STUDENT_ID).slice(0, 3)
  const rawAtt = getStudentAttendance(state, MOCK_STUDENT_ID)

  const attendanceSummary = {
    present: rawAtt.filter((a) => a.status === 'present').length,
    absent:  rawAtt.filter((a) => a.status === 'absent_excused' || a.status === 'absent_unexcused').length,
    late:    rawAtt.filter((a) => a.status === 'late').length,
  }

  const statCards = [
    { value: stats.groupCount,      label: 'Qruplarımın Sayı' },
    { value: stats.totalLessons,    label: 'Keçirilmiş Dərslər' },
    { value: stats.attendancePct + '%', label: 'Davamiyyət Faizim (%)', accent: true },
    { value: stats.avgGrade > 0 ? stats.avgGrade + '%' : '—', label: 'Ortalama Qiymətim (%)', accent: true },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">
        Tələbə Ana Səhifəsi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {statCards.map((stat, idx) => (
          <NeuStatCard
            key={idx}
            value={stat.value}
            label={stat.label}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h2 className="text-base font-semibold text-text-base mb-4">
            Son Qiymətlərim
          </h2>
          {rawGrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-dark/20">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                      Dərs tarixi
                    </th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                      Mövzu
                    </th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                      Bal
                    </th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                      Maksimum bal
                    </th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                      Faiz (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rawGrades.map((grade, index) => (
                    <tr key={grade.lessonId + grade.studentId + index} className="border-b border-surface-dark/20 last:border-0">
                      <td className="py-3 text-sm text-text-base">
                        {grade.lessonDate}
                      </td>
                      <td className="py-3 text-sm text-text-base">
                        {grade.lessonTopic}
                      </td>
                      <td className="py-3 text-sm text-text-base">
                        {grade.score ?? '—'}
                      </td>
                      <td className="py-3 text-sm text-text-base">
                        {grade.maxScore}
                      </td>
                      <td className="py-3 text-sm text-text-base">
                        {grade.score != null ? `${Math.round((grade.score / grade.maxScore) * 100)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-lms-student-muted text-center py-4">
              Hələ qiymət daxil edilməyib
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-neu bg-surface shadow-neu-sm p-5">
            <h2 className="text-base font-semibold text-text-base mb-3">
              Son Materiallar
            </h2>
            {rawMaterials.length > 0 ? (
              <div className="flex flex-col">
                {rawMaterials.map((material, index) => (
                  <div key={material.id}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MaterialTypeBadge type={material.type as MaterialTypeName} size="sm" />
                        <span className="text-sm text-text-base truncate max-w-[160px]" title={material.title}>
                          {material.title}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-primary shrink-0 cursor-pointer" />
                    </div>
                    {index < rawMaterials.length - 1 && (
                      <div className="bg-surface-dark/20 h-px mx-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-lms-student-muted py-2">
                Hələ material paylaşılmayıb
              </p>
            )}
          </div>

          <div className="rounded-neu bg-surface shadow-neu-sm p-5">
            <h2 className="text-base font-semibold text-text-base mb-3">
              Davamiyyət Xülasəsi
            </h2>

            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full px-3 py-1 text-xs font-medium shadow-neu-sm bg-primary/10 text-primary">
                İştirak
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-medium shadow-neu-sm bg-red-100 text-red-600">
                Qaib
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-medium shadow-neu-sm bg-amber-100 text-amber-700">
                Gecikmə
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-neu bg-surface-dark/30 shadow-neu-inset-sm p-3 text-center">
                <span className="block text-lg font-bold text-text-base">
                  {attendanceSummary.present}
                </span>
                <span className="block text-xs text-text-base/50 mt-0.5">
                  İştirak
                </span>
              </div>
              <div className="rounded-neu bg-surface-dark/30 shadow-neu-inset-sm p-3 text-center">
                <span className="block text-lg font-bold text-text-base">
                  {attendanceSummary.absent}
                </span>
                <span className="block text-xs text-text-base/50 mt-0.5">
                  Qaib
                </span>
              </div>
              <div className="rounded-neu bg-surface-dark/30 shadow-neu-inset-sm p-3 text-center">
                <span className="block text-lg font-bold text-text-base">
                  {attendanceSummary.late}
                </span>
                <span className="block text-xs text-text-base/50 mt-0.5">
                  Gecikmə
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
