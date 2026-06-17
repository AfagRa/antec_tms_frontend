import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { groupsApi } from '../../api/groups'
import { teacherPortalApi } from '../../api/teacherPortal'
import { lessonsApi } from '../../api/lessons'
import type { Group } from '../../types'
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
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Mənim Qruplarım</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-base">
            Cəmi Qruplar: <span className="font-semibold">{groups.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-surface-dark/20 bg-surface-light">
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">#</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Qrup adı</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Kurs adı</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Tələbə sayı</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Dərs sayı</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Başlama tarixi</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Bitmə tarixi</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Əməliyyatlar</th>
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
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      group.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {group.status === 'active' ? 'Aktiv' : group.status}
                    </span>
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
