import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, UserCheck } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import WeeklySchedule from '../../components/ui/WeeklySchedule'
import { teacherPortalApi } from '../../api/teacherPortal'
import { ROUTES } from '../../constants/routes'
import type { TeacherDashboardResponse, WeeklyScheduleItem } from '../../types'
import Spinner from '../../components/ui/Spinner'

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null)
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setTeacherId(me.id)
        const [data, scheduleData] = await Promise.all([
          teacherPortalApi.getDashboard(me.id),
          teacherPortalApi.getWeeklySchedule(me.id),
        ])
        setDashboard(data)
        setSchedule(scheduleData)
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Ümumi Aktiv Qruplarım"
          value={dashboard?.total_groups ?? 0}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Həftəlik Dərslər"
          value={`${dashboard?.weekly_lessons_completed ?? 0}/${dashboard?.weekly_lessons_total ?? 0}`}
          icon={<BookOpen size={22} />}
          color="text-success"
        />
        <StatCard
          title="Ümumi Tələbə Sayı"
          value={dashboard?.total_students ?? 0}
          icon={<UserCheck size={22} />}
        />
      </div>

      <div className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-text-base">Həftəlik Cədvəl</h2>
        <WeeklySchedule
          lessons={schedule}
          onLessonClick={(groupId) => navigate(ROUTES.TEACHER_GROUP(String(groupId)))}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,700px)_1fr] gap-4">
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
                    <span className="ml-4 text-xs text-text-base/50">
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
