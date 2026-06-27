import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import NeuStatCard from '../../components/ui/NeuStatCard'
import { studentPortalApi } from '../../api/studentPortal'
import type { MyDashboardResponse } from '../../types'
import { STATUS_LABELS } from '../../types'
import { ROUTES } from '../../constants/routes'
import Spinner from '../../components/ui/Spinner'

interface StudentGroup {
  id: number; name: string; lessonCount: number; averageGrade: number; status: string
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [d, g] = await Promise.all([
          studentPortalApi.getDashboard(),
          studentPortalApi.getMyGroups(),
        ])
        setData(d)
        setGroups(g)
        if (g.length > 0 && selectedGroupId === null) {
          setSelectedGroupId(g[0].id)
        }
      } catch (err) {
        console.warn('Failed to load dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lessons: any[] = data?.recentLessons ?? data?.recent_lessons ?? []
  const grades: any[] = data?.recentGrades ?? data?.recent_grades ?? []
  const attSum: any = data?.attendanceSummary ?? data?.attendance_summary ?? {}

  const lessonDateMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of lessons) {
      const topic = l.topic ?? l.topic
      const date = l.lessonDate ?? l.lesson_date
      if (topic && date) map.set(topic, date)
    }
    return map
  }, [lessons])

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? groups[0]

  if (loading) return <Spinner />
  if (!data) return <p className="text-sm text-text-base/50">Məlumat tapılmadı.</p>

  const attPct = (attSum.total ?? 0) > 0
    ? Math.round(
        (((attSum.present ?? 0) + (attSum.late ?? 0))
          / (attSum.total ?? 1)) * 100
      )
    : 0

  const avgPct = grades.length > 0
    ? `${Math.round(grades.reduce((a: number, g: any) => a + (g.score ?? 0) / Math.max(g.maxScore ?? g.max_score ?? 1, 1), 0) / grades.length * 100)}%`
    : '—'

  const statCards = [
    { value: groups.length, label: 'Qruplar' },
    { value: lessons.length, label: 'Son Dərslər' },
    { value: `${attPct}%`, label: 'Davamiyyət', accent: true },
    { value: avgPct, label: 'Ortalama (%)', accent: true },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Tələbə Ana Səhifəsi</h1>

      {groups.length > 0 ? (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <label className="text-sm text-text-base/50">Qrup:</label>
          <select
            value={selectedGroupId ?? ''}
            onChange={e => setSelectedGroupId(Number(e.target.value))}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer w-fit"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          {selectedGroup && (
            <span className="text-xs text-text-base/40 ml-1">
              Status: {STATUS_LABELS[selectedGroup.status] ?? selectedGroup.status}
            </span>
          )}
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
          {grades.length > 0 ? (
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
                  {grades.map((g: any, i: number) => {
                    const topic = g.lessonTopic ?? g.lesson_topic ?? ''
                    const lessonDate = lessonDateMap.get(topic)
                    const score = g.score ?? 0
                    const maxScore = g.maxScore ?? g.max_score ?? 0
                    return (
                      <tr key={g.id || i} className="border-b border-surface-dark/20 last:border-0">
                        <td className="py-3 text-sm text-text-base">
                          {lessonDate ? new Date(lessonDate).toLocaleDateString('az-AZ') : '—'}
                        </td>
                        <td className="py-3 text-sm text-text-base">{topic}</td>
                        <td className="py-3 text-sm text-text-base">{score}</td>
                        <td className="py-3 text-sm text-text-base">{maxScore}</td>
                        <td className="py-3 text-sm text-text-base">{Math.round((score / Math.max(maxScore, 1)) * 100)}%</td>
                      </tr>
                    )
                  })}
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
            {lessons.length > 0 ? (
              <div className="flex flex-col gap-2">
                {lessons.slice(0, 3).map((l: any, i: number) => (
                  <div key={l.id || i} className="flex items-center justify-between py-2 border-b border-surface-dark/20 last:border-0">
                    <div className="min-w-0">
                      <span className="text-sm text-text-base truncate block">{l.topic}</span>
                      <span className="text-xs text-text-base/50">{new Date(l.lesson_date ?? l.lessonDate).toLocaleDateString('az-AZ')}</span>
                    </div>
                    {(l.material_count ?? l.materialCount ?? 0) > 0 && (
                      <button
                        onClick={() => navigate(`${ROUTES.STUDENT_MATERIALS}?topic=${encodeURIComponent(l.topic)}`)}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        {l.material_count ?? l.materialCount} material
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
                  {(attSum.present ?? 0) + (attSum.late ?? 0)}
                </span>
                <span className="block text-xs text-emerald-600/70 mt-0.5">İştirak</span>
              </div>
              <div className="rounded-lg bg-red-50 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-red-600">
                  {attSum.absent ?? 0}
                </span>
                <span className="block text-xs text-red-500/70 mt-0.5">Qaib</span>
              </div>
              <div className="rounded-lg bg-surface-dark/20 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-text-base">
                  {attSum.total ?? 0}
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
