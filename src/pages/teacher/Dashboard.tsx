import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, UserCheck } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import { teacherPortalApi } from '../../api/teacherPortal'
import { ROUTES } from '../../constants/routes'
import type { TeacherDashboardResponse } from '../../types'
import Spinner from '../../components/ui/Spinner'

const DAY_LABELS: Record<string, string> = {
  Monday:    'B.e',
  Tuesday:   'Ç.a',
  Wednesday: 'Çərşənbə',
  Thursday:  'C.a',
  Friday:    'Cümə',
  Saturday:  'Şənbə',
  Sunday:    'Bazar',
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function formatTime(time: string): string {
  return time.slice(0, 5)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
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

  const schedule = dashboard?.weeklySchedule ?? []

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-base">Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <h2 className="mb-4 text-base font-bold text-text-base">Həftəlik Cədvəl</h2>
        {schedule.length === 0 ? (
          <div className="rounded-neu bg-surface shadow-neu-sm p-6 text-center text-sm text-text-base/50 italic">
            Cədvəl məlumatı yoxdur.
          </div>
        ) : (
          <div className="rounded-neu bg-surface shadow-neu-sm overflow-auto">
            <div className="grid min-w-[700px]" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
              {DAY_ORDER.map((day) => (
                <div
                  key={day}
                  className="border-r border-surface-dark/20 last:border-r-0 px-2 py-2"
                >
                  <div className="sticky top-0 bg-surface border-b border-surface-dark/20 pb-2 mb-2 text-center text-xs font-semibold uppercase tracking-wide text-text-base/50">
                    {DAY_LABELS[day]}
                  </div>
                  <div className="space-y-1.5 min-h-[80px]">
                    {schedule
                      .filter((item) => item.dayOfWeek === day)
                      .map((item, idx) => (
                        <button
                          key={`${item.groupId}-${day}-${idx}`}
                          onClick={() => navigate(ROUTES.TEACHER_GROUP(String(item.groupId)))}
                          className="w-full rounded-neu-sm bg-surface shadow-neu-sm text-left p-2 hover:border-success hover:shadow-md transition-all cursor-pointer group"
                        >
                          <p className="text-xs font-medium text-text-base group-hover:text-success transition-colors truncate">
                            {item.groupName}
                          </p>
                          <p className="text-[10px] text-text-base/50 mt-0.5 truncate">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </p>
                          {item.roomOrNote && (
                            <p className="text-[10px] text-text-base/30 mt-0.5 truncate">
                              {item.roomOrNote}
                            </p>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-6">
          <h2 className="mb-4 text-base font-bold text-text-base">Son Dərslər</h2>
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
          <h2 className="mb-4 text-base font-bold text-text-base">
            Son Bildirişlər və Elanlar
          </h2>
          <p className="text-sm text-text-base/50">Hazırda bildiriş yoxdur.</p>
        </div>
      </div>
    </div>
  )
}
