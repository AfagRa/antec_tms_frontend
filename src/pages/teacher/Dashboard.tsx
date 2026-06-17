import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Users, UserCheck } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import WeeklySchedule, { type ScheduleLesson } from '../../components/ui/WeeklySchedule'
import { ROUTES } from '../../constants/routes'
import { teacherPortalApi } from '../../api/teacherPortal'
import { useAuth } from '../../hooks/useAuth'
import type { TeacherDashboardResponse } from '../../types'
import Spinner from '../../components/ui/Spinner'

const schedule: ScheduleLesson[] = [
  { id: 's1', groupId: '1', groupName: 'Python-A1', topic: 'Dəyişənlər', timeSlot: '09:00–10:30', day: 0 },
  { id: 's2', groupId: '2', groupName: 'Code-A2', topic: 'Funksiyalar', timeSlot: '11:00–12:30', day: 0 },
  { id: 's3', groupId: '1', groupName: 'Python-A1', topic: 'Massivlər', timeSlot: '09:00–10:30', day: 2 },
  { id: 's4', groupId: '3', groupName: 'JS-B1', topic: 'Döngülər', timeSlot: '14:00–15:30', day: 2 },
  { id: 's5', groupId: '2', groupName: 'Code-A2', topic: 'Obyektlər', timeSlot: '11:00–12:30', day: 4 },
  { id: 's6', groupId: '3', groupName: 'JS-B1', topic: 'Siniflər', timeSlot: '09:00–10:30', day: 3 },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
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

  const handleLessonClick = (groupId: string) =>
    navigate(ROUTES.TEACHER_GROUP(groupId))

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
