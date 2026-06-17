import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Grid } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { studentPortalApi } from '../../api/studentPortal'
import type { MyLessonItem, MyGradeItem } from '../../types'
import Spinner from '../../components/ui/Spinner'

interface GroupInfo {
  id: number
  name: string
  lessonCount: number
  avgGrade: number
}

export default function StudentGroups() {
  const [lessons, setLessons] = useState<MyLessonItem[]>([])
  const [grades, setGrades] = useState<MyGradeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [l, g] = await Promise.all([
          studentPortalApi.getLessons(),
          studentPortalApi.getGrades(),
        ])
        setLessons(l)
        setGrades(g)
      } catch (err) {
        console.warn('Failed to load groups data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const groups = useMemo(() => {
    const groupMap = new Map<string, GroupInfo>()
    lessons.forEach((l) => {
      const key = l.group_name
      if (!groupMap.has(key)) {
        groupMap.set(key, { id: 0, name: key, lessonCount: 0, avgGrade: 0 })
      }
      groupMap.get(key)!.lessonCount++
    })

    const gradeMap = new Map<string, number[]>()
    grades.forEach((g) => {
      const key = g.lesson_topic
      if (!gradeMap.has(key)) gradeMap.set(key, [])
      gradeMap.get(key)!.push(g.score)
    })

    return Array.from(groupMap.values()).map((g) => {
      const allScores: number[] = []
      lessons
        .filter((l) => l.group_name === g.name)
        .forEach((l) => {
          const gr = grades.find((x) => x.lesson_topic === l.topic)
          if (gr) allScores.push(gr.score)
        })
      return {
        ...g,
        avgGrade: allScores.length
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 0,
      }
    })
  }, [lessons, grades])

  const groupNames = groups.map((g) => g.name)

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()),
    [lessons],
  )

  const gradeByTopic = useMemo(() => {
    const m = new Map<string, MyGradeItem>()
    grades.forEach((g) => m.set(g.lesson_topic, g))
    return m
  }, [grades])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-base">Mənim Qruplarım və Kurslarım</h1>

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
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Qrup adı</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Dərs sayı</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Ortalama bal (%)</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Status</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50" />
              </tr>
              <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr key={group.name}>
                  <td className="py-3.5 text-sm text-text-base truncate pr-2">{group.name}</td>
                  <td className="py-3.5 text-sm text-text-base pr-2">{group.lessonCount}</td>
                  <td className="py-3.5 text-sm text-text-base pr-2">{group.avgGrade}%</td>
                  <td className="py-3.5 text-sm">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm bg-primary/10 text-primary">Aktiv</span>
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
        <h2 className="text-base font-semibold text-text-base mb-4">Mənim Dərslərim</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Dərs tarixi</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Mövzu</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Qrup</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">Materiallar</th>
              </tr>
              <tr><td colSpan={4} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {sortedLessons.map((lesson, index) => {
                const grade = gradeByTopic.get(lesson.topic)
                return (
                  <tr key={lesson.id || index}>
                    <td className="py-3.5 text-sm text-text-base pr-2">{new Date(lesson.lesson_date).toLocaleDateString('az-AZ')}</td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2">{lesson.topic}</td>
                    <td className="py-3.5 text-sm text-text-base pr-2">{lesson.group_name}</td>
                    <td className="py-3.5 text-sm">
                      {lesson.materials.length > 0
                        ? `${lesson.materials.length} material`
                        : <span className="text-text-base/50">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
              {sortedLessons.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-sm text-text-base/50">Dərs tapılmadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
