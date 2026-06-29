import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Grid } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { studentPortalApi } from '../../api/studentPortal'
import { getMaterialHref } from '../../utils/material'
import type { MyLessonItem } from '../../types'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { MaterialTypeBadge } from '../../components/ui/MaterialTypeBadge'

interface GroupInfo {
  id: number
  name: string
  lessonCount: number
  avgGrade: string
  status: string
}

export default function StudentGroups() {
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [lessons, setLessons] = useState<MyLessonItem[]>([])
  const [lessonGroupFilter, setLessonGroupFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [g, l, d] = await Promise.all([
          studentPortalApi.getMyGroups(),
          studentPortalApi.getLessons(),
          studentPortalApi.getDashboard(),
        ])
        const grades = d.recentGrades ?? d.recent_grades ?? []
        let avgStr = '-'
        if (Array.isArray(grades) && grades.length > 0) {
          const pcts = grades.map((gr: any) => {
            const score = gr.score ?? 0
            const maxScore = gr.maxScore ?? gr.max_score ?? 1
            return (score / Math.max(maxScore, 1)) * 100
          })
          const avg = pcts.reduce((a: number, b: number) => a + b, 0) / pcts.length
          avgStr = avg.toFixed(1) + '%'
        }
        setGroups(g.map((grp: any) => ({
          id: grp.id,
          name: grp.name,
          lessonCount: grp.lessonCount ?? grp.lesson_count ?? 0,
          avgGrade: avgStr,
          status: grp.status ?? 'active',
        })))
        setLessons(l)
      } catch (err) {
        console.warn('Failed to load groups data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const groupNames = groups.map((g) => g.name)

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()),
    [lessons],
  )

  const filteredLessons = useMemo(
    () => sortedLessons.filter(l =>
      lessonGroupFilter === 'all' || l.group_name === lessonGroupFilter
    ),
    [sortedLessons, lessonGroupFilter],
  )

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-base">Mənim Qruplarım</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 rounded-neu bg-surface-dark/30 shadow-neu-inset-sm px-4 py-2 text-sm font-medium">
            <Grid size={16} className="text-primary" />
            <span className="text-text-base">Ümumi Qruplarım: {groups.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '160px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '220px' }} />
            </colgroup>
            <thead>
              <tr className="bg-surface-dark/20">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Qrup adı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Dərs sayı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Ortalama bal (%)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60" />
              </tr>
              <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr key={group.id || index}>
                  <td className="py-3.5 text-sm text-text-base truncate pr-2">{group.name}</td>
                  <td className="py-3.5 text-sm text-text-base pr-2">{group.lessonCount}</td>
                  <td className="py-3.5 text-sm text-text-base pr-2">{group.avgGrade}</td>
                  <td className="py-3.5 text-sm">
                    <Badge status={group.status} />
                  </td>
                  <td className="py-3.5 text-sm">
                    <Link to={`${ROUTES.STUDENT_MATERIALS}?group=${group.name}`} className="text-primary text-sm font-medium hover:underline">
                      Materiallara Bax
                    </Link>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-text-base/50">Heç bir qrup tapılmadı</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-base">Mənim Dərslərim</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setLessonGroupFilter('all')}
              className={lessonGroupFilter === 'all'
                ? 'rounded-full px-3 py-1 text-xs font-medium bg-primary text-white shadow-neu-sm'
                : 'rounded-full px-3 py-1 text-xs font-medium bg-surface text-text-base/50 shadow-neu-sm hover:text-primary'}
            >
              Hamısı
            </button>
            {groupNames.map(name => (
              <button
                key={name}
                onClick={() => setLessonGroupFilter(name)}
                className={lessonGroupFilter === name
                  ? 'rounded-full px-3 py-1 text-xs font-medium bg-primary text-white shadow-neu-sm'
                  : 'rounded-full px-3 py-1 text-xs font-medium bg-surface text-text-base/50 shadow-neu-sm hover:text-primary'}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ minWidth: '350px' }} />
            </colgroup>
            <thead>
              <tr className="bg-surface-dark/20">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Dərs tarixi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Mövzu</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Qrup</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Materiallar</th>
              </tr>
              <tr><td colSpan={4} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson, index) => {
                return (
                  <tr key={lesson.id || index}>
                    <td className="py-3.5 text-sm text-text-base px-4">{new Date(lesson.lesson_date).toLocaleDateString('az-AZ')}</td>
                    <td className="py-3.5 text-sm text-text-base truncate px-4">{lesson.topic}</td>
                    <td className="py-3.5 text-sm text-text-base px-4">{lesson.group_name}</td>
                    <td className="py-3.5 text-sm px-4">
                      {lesson.materials.length === 0 ? (
                        <span className="text-text-base/50">—</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {lesson.materials.slice(0, 2).map(m => {
                            const href = getMaterialHref(m)
                            if (!href) {
                              return (
                                <span key={m.id} className="flex items-center gap-1.5 text-text-base/50 cursor-default">
                                  <MaterialTypeBadge type={m.type as any} size="sm" />
                                  <span className="truncate text-xs">{m.title}</span>
                                </span>
                              )
                            }
                            return (
                              <a key={m.id} href={href} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:underline"
                                title={m.title}
                              >
                                <MaterialTypeBadge type={m.type as any} size="sm" />
                                <span className="truncate text-xs text-text-base">{m.title}</span>
                              </a>
                            )
                          })}
                          {lesson.materials.length > 2 && (
                            <span className="text-[11px] text-text-base/50">
                              +{lesson.materials.length - 2} daha
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredLessons.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-sm text-text-base/50">Dərs tapılmadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
