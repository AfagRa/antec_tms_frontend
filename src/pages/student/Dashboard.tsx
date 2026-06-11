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
      <h1 className="mb-6 text-2xl font-semibold text-lms-student-text">
        Tələbə Ana Səhifəsi
      </h1>

      {/* Stat grid: grid grid-cols-4 gap-5 mb-6 */}
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

      {/* Bottom grid: grid grid-cols-[1fr_340px] gap-5 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* LEFT card "Son Qiymətlərim": .neu-card */}
        <div className="neu-card">
          <h2 className="text-base font-semibold text-lms-student-text mb-4">
            Son Qiymətlərim
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-lms-student-inset">
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                    Dərs tarixi
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                    Mövzu
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                    Bal
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                    Maksimum bal
                  </th>
                  <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                    Faiz (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentGrades.map((grade, index) => (
                  <tr key={index} className="border-b border-lms-student-inset last:border-0">
                    <td className="py-3 text-sm text-lms-student-text">
                      {grade.date}
                    </td>
                    <td className="py-3 text-sm text-lms-student-text">
                      {grade.topic}
                    </td>
                    <td className="py-3 text-sm text-lms-student-text">
                      {grade.score}
                    </td>
                    <td className="py-3 text-sm text-lms-student-text">
                      {grade.maxScore}
                    </td>
                    <td className="py-3 text-sm text-lms-student-text">
                      {grade.percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT column: flex flex-col gap-5 */}
        <div className="flex flex-col gap-5">
          {/* RIGHT top card "Son Materiallar": .neu-card */}
          <div className="neu-card">
            <h2 className="text-base font-semibold text-lms-student-text mb-3">
              Son Materiallar
            </h2>
            <div className="flex flex-col">
              {recentMaterials.map((material, index) => (
                <div key={material.id}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-lms-student-text truncate max-w-[220px]" title={material.title}>
                      {material.title}
                    </span>
                    <ExternalLink size={14} className="text-lms-student-accent flex-shrink-0 cursor-pointer" />
                  </div>
                  {index < recentMaterials.length - 1 && (
                    <div className="bg-lms-student-inset h-px mx-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT bottom card "Davamiyyət Xülasəsi": .neu-card */}
          <div className="neu-card">
            <h2 className="text-base font-semibold text-lms-student-text mb-3">
              Davamiyyət Xülasəsi
            </h2>
            
            {/* Badges: flex gap-2 flex-wrap */}
            <div className="flex gap-2 flex-wrap">
              <span className="neu-badge bg-lms-student-accentLt text-lms-student-accent">
                İştirak
              </span>
              <span className="neu-badge bg-red-100 text-red-600">
                Qayıb
              </span>
              <span className="neu-badge bg-amber-100 text-amber-700">
                Gecikma
              </span>
            </div>

            {/* Grid grid-cols-3 gap-2 mt-3 */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="neu-card-inset text-center !p-3 !rounded-xl">
                <span className="block text-lg font-bold text-lms-student-text">
                  {attendanceSummary.present}
                </span>
                <span className="block text-xs text-lms-student-muted mt-0.5">
                  İştirak
                </span>
              </div>
              <div className="neu-card-inset text-center !p-3 !rounded-xl">
                <span className="block text-lg font-bold text-lms-student-text">
                  {attendanceSummary.absent}
                </span>
                <span className="block text-xs text-lms-student-muted mt-0.5">
                  Qayıb
                </span>
              </div>
              <div className="neu-card-inset text-center !p-3 !rounded-xl">
                <span className="block text-lg font-bold text-lms-student-text">
                  {attendanceSummary.late}
                </span>
                <span className="block text-xs text-lms-student-muted mt-0.5">
                  Gecikma
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
