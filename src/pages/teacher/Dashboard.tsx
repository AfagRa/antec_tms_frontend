import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, UserCheck } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import { teacherPortalApi } from '../../api/teacherPortal'
import { ROUTES } from '../../constants/routes'
import type { TeacherDashboardResponse, DashboardScheduleItem } from '../../types'
import Spinner from '../../components/ui/Spinner'

const DAYS = [
  { key: 'Monday', label: 'B.e' },
  { key: 'Tuesday', label: 'Ç.a' },
  { key: 'Wednesday', label: 'Çərşənbə' },
  { key: 'Thursday', label: 'C.a' },
  { key: 'Friday', label: 'Cümə' },
  { key: 'Saturday', label: 'Şənbə' },
]

function buildHourSlots(schedule: DashboardScheduleItem[]): string[] {
  if (schedule.length === 0) {
    return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  }
  const starts = schedule.map((s) => parseInt(s.start_time.split(':')[0], 10))
  const ends = schedule.map((s) => parseInt(s.end_time.split(':')[0], 10))
  const minHour = Math.min(...starts)
  const maxHour = Math.max(...ends)
  const slots: string[] = []
  for (let h = minHour; h < maxHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

function findForSlot(schedule: DashboardScheduleItem[], day: string, hourSlot: string) {
  const hour = parseInt(hourSlot.split(':')[0], 10)
  return schedule.find((s) => {
    if (s.day_of_week !== day) return false
    const startHour = parseInt(s.start_time.split(':')[0], 10)
    const endHour = parseInt(s.end_time.split(':')[0], 10)
    return hour >= startHour && hour < endHour
  })
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

  const schedule = dashboard?.weekly_schedule ?? []

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
            <div
              className="grid min-w-[600px]"
              style={{ gridTemplateColumns: `110px repeat(${DAYS.length}, 1fr)` }}
            >
              <div className="sticky top-0 z-10 bg-surface border-b border-r border-surface-dark/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                Saat
              </div>
              {DAYS.map((d) => (
                <div
                  key={d.key}
                  className="sticky top-0 z-10 bg-surface border-b border-r border-surface-dark/20 px-2 py-2 text-center text-xs font-semibold text-text-base/50 uppercase tracking-wide"
                >
                  {d.label}
                </div>
              ))}
              {buildHourSlots(schedule).map((slot) => (
                <div key={slot} className="contents">
                  <div className="border-b border-r border-surface-dark/20 px-3 py-3 text-xs font-medium text-text-base/70 whitespace-nowrap">
                    {slot}
                  </div>
                  {DAYS.map((d) => {
                    const match = findForSlot(schedule, d.key, slot)
                    return (
                      <div
                        key={d.key}
                        className="border-b border-r border-surface-dark/20 px-2 py-2 min-h-[60px]"
                      >
                        {match ? (
                          <button
                            onClick={() => navigate(ROUTES.TEACHER_GROUP(String(match.group_id)))}
                            className="rounded-neu bg-surface shadow-neu-sm text-left p-2 hover:border-success hover:shadow-md transition-all cursor-pointer group w-full"
                          >
                            <p className="text-xs font-medium text-text-base group-hover:text-success transition-colors truncate">
                              {match.group_name}
                            </p>
                            {match.room_or_note && (
                              <p className="text-[10px] text-text-base/30 mt-0.5 truncate">
                                {match.room_or_note}
                              </p>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-text-base/30 italic">—</div>
                        )}
                      </div>
                    )
                  })}
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
