import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, TrendingUp, Users } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
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
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [attJournal, setAttJournal] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [d, g, l, att] = await Promise.all([
          studentPortalApi.getDashboard(),
          studentPortalApi.getMyGroups(),
          studentPortalApi.getLessons(),
          studentPortalApi.getAttendanceJournal(),
        ])
        setData(d)
        setGroups(g)
        setAllLessons(Array.isArray(l) ? l : [])
        setAttJournal(att.items ?? [])
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

  const grades: any[] = data?.recentGrades ?? data?.recent_grades ?? []
  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? groups[0]

  const groupLessons = useMemo(() => {
    if (!selectedGroup) return allLessons
    return allLessons.filter(l => l.group_name === selectedGroup.name)
  }, [allLessons, selectedGroup])

  const groupLessonTopics = useMemo(() => new Set(groupLessons.map(l => l.topic)), [groupLessons])

  const groupLessonDates = useMemo(() => {
    return new Set(
      groupLessons
        .map(l => {
          const d = new Date(l.lesson_date)
          return isNaN(d.getTime()) ? '' : d.toDateString()
        })
        .filter(Boolean)
    )
  }, [groupLessons])

  const lessonDateMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of groupLessons) {
      const topic = l.topic
      const date = l.lesson_date
      if (topic && date) map.set(topic, date)
    }
    return map
  }, [groupLessons])

  const groupGrades = useMemo(() => {
    return grades.filter(g => {
      const topic = g.lessonTopic ?? g.lesson_topic
      return groupLessonTopics.has(topic)
    })
  }, [grades, groupLessonTopics])

  const groupAttItems = useMemo(() => {
    return attJournal.filter((r: any) => {
      const d = new Date(r.created_at)
      return groupLessonDates.has(d.toDateString())
    })
  }, [attJournal, groupLessonDates])

  const groupAttSum = useMemo(() => {
    const present = groupAttItems.filter((r: any) => /^Present$/i.test(r.status)).length
    const late = groupAttItems.filter((r: any) => /^Late$/i.test(r.status)).length
    const absent = groupAttItems.filter((r: any) => /^Absent/i.test(r.status)).length
    const total = present + late + absent
    const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    return { present, late, absent, total, pct }
  }, [groupAttItems])

  const groupAvgPct = useMemo(() => {
    if (groupGrades.length === 0) return null
    const scores = groupGrades.map((g: any) => {
      const score = g.score ?? 0
      const maxScore = g.maxScore ?? g.max_score ?? 1
      return (score / Math.max(maxScore, 1)) * 100
    })
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
  }, [groupGrades])

  if (loading) return <Spinner />
  if (!data) return <p className="text-sm text-text-base/50">Məlumat tapılmadı.</p>

  const attPct = groupAttSum.total > 0 ? groupAttSum.pct : 0
  const avgPctDisplay = groupAvgPct !== null ? `${groupAvgPct}%` : '—'

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-base">Tələbə Ana Səhifəsi</h1>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard title="Qruplar" value={groups.length} icon={<Users size={22} />} />
        <StatCard title="Davamiyyət" value={`${attPct}%`} icon={<BookOpen size={22} />} color="text-primary" />
        <StatCard title="Ortalama (%)" value={avgPctDisplay} icon={<TrendingUp size={22} />} color="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h2 className="text-base font-bold text-text-base mb-4">Son Qiymətlərim</h2>
          {groupGrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-dark/20">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Dərs tarixi</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Mövzu</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Bal</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Maksimum</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Faiz (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {groupGrades.map((g: any, i: number) => {
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
            <h2 className="text-base font-bold text-text-base mb-3">Son Dərslər</h2>
            {groupLessons.length > 0 ? (
              <div className="flex flex-col gap-2">
                {groupLessons.slice(0, 3).map((l: any, i: number) => (
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
            <h2 className="text-sm font-bold text-text-base mb-3">Davamiyyət Xülasəsi</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-emerald-700">
                  {groupAttSum.present + groupAttSum.late}
                </span>
                <span className="block text-xs text-emerald-600/70 mt-0.5">İştirak</span>
              </div>
              <div className="rounded-lg bg-red-50 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-red-600">
                  {groupAttSum.absent}
                </span>
                <span className="block text-xs text-red-500/70 mt-0.5">Qaib</span>
              </div>
              <div className="rounded-lg bg-surface-dark/20 px-3 py-3 shadow-neu-sm">
                <span className="block text-xl font-bold text-text-base">
                  {groupAttSum.total}
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
