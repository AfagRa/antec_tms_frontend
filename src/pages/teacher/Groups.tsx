import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { groupsApi } from '../../api/groups'
import { teacherPortalApi } from '../../api/teacherPortal'
import { lessonsApi } from '../../api/lessons'
import type { Group } from '../../types'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        const res = await groupsApi.list({ teacher_id: me.id })
        const data = res.data ?? (Array.isArray(res) ? res : [])
        setGroups(data)

        const counts: Record<number, number> = {}
        await Promise.all(
          data.map(async (g: Group) => {
            try {
              const lessons = await lessonsApi.getByGroup(Number(g.id))
              counts[Number(g.id)] = lessons.length
            } catch {
              counts[Number(g.id)] = 0
            }
          }),
        )
        setLessonCounts(counts)
      } catch (err) {
        console.warn('Failed to load groups', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-base">Mənim Qruplarım</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-base">
            Cəmi Qruplar: <span className="font-bold">{groups.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="min-w-max w-full">
            <thead>
              <tr className="bg-surface-dark/20">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">#</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Qrup adı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Kurs adı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tələbə sayı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Dərs sayı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Başlama tarixi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Bitmə tarixi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr key={group.id} className="border-b border-surface-dark/20 last:border-0">
                  <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.name}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.course?.name ?? '—'}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.students_count}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{lessonCounts[Number(group.id)] ?? 0}</td>
                  <td className="px-3 py-3 text-sm text-text-base">
                    {group.start_date ? new Date(group.start_date).toLocaleDateString('az-AZ') : '—'}
                  </td>
                  <td className="px-3 py-3 text-sm text-text-base">
                    {group.end_date ? new Date(group.end_date).toLocaleDateString('az-AZ') : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <Badge status={group.status} />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to={ROUTES.TEACHER_GROUP(String(group.id))}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Detallara Bax
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
