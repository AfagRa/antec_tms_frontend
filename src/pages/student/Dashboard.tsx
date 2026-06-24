import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NeuStatCard from '../../components/ui/NeuStatCard'
import { studentPortalApi } from '../../api/studentPortal'
import type { MyDashboardResponse, MyRecentGrade, MyRecentLesson } from '../../types'
import { STATUS_LABELS } from '../../types'
import { ROUTES } from '../../constants/routes'
import Spinner from '../../components/ui/Spinner'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<MyDashboardResponse | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const d = await studentPortalApi.getDashboard()
        setData(d)
      } catch (err) {
        console.warn('Failed to load dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grpList = data?.group ? [data.group] : []

  useEffect(() => {
    if (grpList.length > 0 && selectedGroupId === null) {
      setSelectedGroupId(grpList[0].id)
    }
  }, [grpList, selectedGroupId])

  if (loading) return <Spinner />
  if (!data) return <p className="text-sm text-text-base/50">Məlumat tapılmadı.</p>

  // TODO: API response missing group_id/group_name on recent_grades,
  // recent_lessons — cannot filter by group until backend adds this field

  const attPct = data.attendance_summary.total > 0
    ? Math.round(
        ((data.attendance_summary.present + data.attendance_summary.late)
          / data.attendance_summary.total) * 100
      )
    : 0

  const statCards = [
    { value: grpList.length, label: 'Qruplar' },
    { value: data.recent_lessons.length, label: 'Son Dərslər' },
    { value: `${attPct}%`, label: 'Davamiyyət', accent: true },
    { value: data.recent_grades.length > 0 ? `${Math.round(data.recent_grades.reduce((a, g) => a + g.score / g.max_score, 0) / data.recent_grades.length * 100)}%` : '—', label: 'Ortalama (%)', accent: true },
  ]

  const selectedGroup = grpList.find(g => g.id === selectedGroupId) ?? grpList[0]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Tələbə Ana Səhifəsi</h1>

      {grpList.length > 1 ? (
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm text-text-base/50">Qrup:</label>
          <select
            value={selectedGroupId ?? ''}
            onChange={e => setSelectedGroupId(Number(e.target.value))}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-fit"
          >
            {grpList.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <span className="text-xs text-text-base/40">{grpList.length} qrup</span>
        </div>
      ) : grpList.length === 1 ? (
        <div className="mb-4 rounded-neu bg-surface px-4 py-2 shadow-neu-inset-sm inline-flex items-center gap-2">
          <span className="text-sm font-medium text-text-base">{selectedGroup?.name}</span>
          <span className="text-xs text-text-base/40">
            Status: {STATUS_LABELS[selectedGroup?.status ?? ''] ?? selectedGroup?.status}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {statCards.map((stat, idx) => (
          <NeuStatCard key={idx} value={stat.value} label={stat.label} accent={stat.accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h2 className="text-base font-semibold text-text-base mb-4">Son Qiymətlərim</h2>
          {/* TODO: filter by selectedGroupId when API returns group_id on recent_grades */}
          {data.recent_grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-dark/20">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Dərs tarixi</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Mövzu</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Bal</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Maksimum</th>
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Faiz (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_grades.map((g, i) => (
                    <tr key={g.id || i} className="border-b border-surface-dark/20 last:border-0">
                      <td className="py-3 text-sm text-text-base">{g.lesson_date ? new Date(g.lesson_date).toLocaleDateString('az-AZ') : '—'}</td>
                      <td className="py-3 text-sm text-text-base">{g.lesson_topic}</td>
                      <td className="py-3 text-sm text-text-base">{g.score}</td>
                      <td className="py-3 text-sm text-text-base">{g.max_score}</td>
                      <td className="py-3 text-sm text-text-base">{Math.round((g.score / g.max_score) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-base/50 text-center py-4">Hələ qiymət daxil edilməyib</p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-neu bg-surface shadow-neu-sm p-5">
            <h2 className="text-base font-semibold text-text-base mb-3">Son Dərslər</h2>
            {/* TODO: filter by selectedGroupId when API returns group_id on recent_lessons */}
            {data.recent_lessons.length > 0 ? (
              <div className="flex flex-col gap-2">
                {data.recent_lessons.slice(0, 3).map((l, i) => (
                  <div key={l.id || i} className="flex items-center justify-between py-2 border-b border-surface-dark/20 last:border-0">
                    <div className="min-w-0">
                      <span className="text-sm text-text-base truncate block">{l.topic}</span>
                      <span className="text-xs text-text-base/50">{new Date(l.lesson_date).toLocaleDateString('az-AZ')}</span>
                    </div>
                    {l.material_count > 0 && (
              <button
                onClick={() => navigate(`${ROUTES.STUDENT_MATERIALS}?topic=${encodeURIComponent(l.topic)}`)}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                {l.material_count} material
              </button>
            )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-base/50 py-2">Hələ dərs keçirilməyib</p>
            )}
          </div>

          <div className="rounded-neu bg-surface shadow-neu-sm p-5">
            <h2 className="text-sm font-semibold text-text-base mb-3">Davamiyyət Xülasəsi</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-emerald-700">
                  {data.attendance_summary.present + data.attendance_summary.late}
                </span>
                <span className="block text-xs text-emerald-600/70 mt-0.5">İştirak</span>
              </div>
              <div className="rounded-lg bg-red-50 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-red-600">
                  {data.attendance_summary.absent}
                </span>
                <span className="block text-xs text-red-500/70 mt-0.5">Qaib</span>
              </div>
              <div className="rounded-lg bg-surface-dark/20 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-text-base">
                  {data.attendance_summary.total}
                </span>
                <span className="block text-xs text-text-base/50 mt-0.5">Ümumi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
