import { useState, useEffect } from 'react'
import { BookOpen, FileText, Users, UserCheck } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import { teacherPortalApi } from '../../api/teacherPortal'
import type { TeacherDashboardResponse } from '../../types'
import Spinner from '../../components/ui/Spinner'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setTeacherId(me.id)
        const data = await teacherPortalApi.getDashboard(me.id)
        setDashboard(data)
      } catch {
        console.warn('Failed to load teacher dashboard')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Mənim Aktiv Qruplarım Sayı"
          value={dashboard?.total_groups ?? 0}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Bu Həftə Keçirilmiş Dərslər Sayı"
          value={dashboard?.upcoming_lessons ?? 0}
          icon={<BookOpen size={22} />}
          color="text-success"
        />
        <StatCard
          title="Doldurulmamış Jurnallar Sayı"
          value={dashboard?.pending_grades ?? 0}
          icon={<FileText size={22} />}
          color="text-warning"
        />
        <StatCard
          title="Ümumi Tələbə Sayı"
          value={dashboard?.total_students ?? 0}
          icon={<UserCheck size={22} />}
        />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-text-base">Son Dərslər</h2>
          {dashboard?.recent_lessons && dashboard.recent_lessons.length > 0 ? (
            <ul className="space-y-2">
              {dashboard.recent_lessons.slice(0, 5).map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between border-b border-surface-dark/20 py-2 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-text-base">{lesson.topic}</span>
                    <span className="ml-2 text-xs text-text-base/50">
                      {lesson.group_name}
                    </span>
                  </div>
                  <span className="text-xs text-text-base/50">
                    {new Date(lesson.lesson_date).toLocaleDateString('az-AZ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-base/50">Hələ dərs yoxdur.</p>
          )}
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-semibold text-text-base">
            Son Bildirişlər və Elanlar
          </h2>
          <p className="text-sm text-text-base/50">Hazırda bildiriş yoxdur.</p>
        </div>
      </div>
    </div>
  )
}
