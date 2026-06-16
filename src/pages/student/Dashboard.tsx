import { ExternalLink } from 'lucide-react'
import NeuStatCard from '../../components/ui/NeuStatCard'

const stats = [
  { value: 19, label: 'Qruplarımın Sayı' },
  { value: 33, label: 'Keçirilmiş Dərslər' },
  { value: 90, label: 'Davamiyyət Faizim (%)', accent: true },
  { value: 78, label: 'Ortalama Qiymətim (%)', accent: true },
]

const recentGrades = [
  { date: '03.07.2023', topic: 'Dərs mövzusu', score: 45, maxScore: 30, percent: 60 },
  { date: '03.07.2023', topic: 'Dərs mövzusu', score: 40, maxScore: 30, percent: 95 },
  { date: '03.07.2023', topic: 'Dərs mövzusu', score: 40, maxScore: 40, percent: 60 },
  { date: '03.07.2023', topic: 'Dərs mövzusu', score: 55, maxScore: 40, percent: 50 },
]

const recentMaterials = [
  { id: '1', title: 'Dərs Studiam ve Kocultımın Sayı...' },
  { id: '2', title: 'Dərs Datatlari ve Keçirilmiş Dərslər...' },
  { id: '3', title: 'Dərs Davamiyyat dcanim Materialları' },
]

const attendanceSummary = { present: 27, absent: 4, late: 2 }

export default function StudentDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">
        Tələbə Ana Səhifəsi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat, idx) => (
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
                {recentGrades.map((grade, index) => (
                  <tr key={index} className="border-b border-surface-dark/20 last:border-0">
                    <td className="py-3 text-sm text-text-base">
                      {grade.date}
                    </td>
                    <td className="py-3 text-sm text-text-base">
                      {grade.topic}
                    </td>
                    <td className="py-3 text-sm text-text-base">
                      {grade.score}
                    </td>
                    <td className="py-3 text-sm text-text-base">
                      {grade.maxScore}
                    </td>
                    <td className="py-3 text-sm text-text-base">
                      {grade.percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-neu bg-surface shadow-neu-sm p-5">
            <h2 className="text-base font-semibold text-text-base mb-3">
              Son Materiallar
            </h2>
            <div className="flex flex-col">
              {recentMaterials.map((material, index) => (
                <div key={material.id}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-text-base truncate max-w-[220px]" title={material.title}>
                      {material.title}
                    </span>
                    <ExternalLink size={14} className="text-primary shrink-0 cursor-pointer" />
                  </div>
                  {index < recentMaterials.length - 1 && (
                    <div className="bg-surface-dark/20 h-px mx-0" />
                  )}
                </div>
              ))}
            </div>
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