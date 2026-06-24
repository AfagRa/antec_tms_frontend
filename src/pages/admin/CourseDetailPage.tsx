import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { coursesApi } from '@/api/courses'
import { groupsApi } from '@/api/groups'
import { teachersApi } from '@/api/teachers'
import type { Course, Group, Teacher } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'

type Tab = 'groups' | 'teachers'

const tabs: { key: Tab; label: string; emoji: string }[] = [
  { key: 'groups', label: 'Qruplar', emoji: '👥' },
  { key: 'teachers', label: 'Müəllimlər', emoji: '👨‍🏫' },
]

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [courseNotFound, setCourseNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('groups')

  const courseId = Number(id)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [courseData, groupData, teacherData] = await Promise.all([
          coursesApi.get(courseId),
          groupsApi.list({ course_id: courseId }),
          teachersApi.list(),
        ])
        setCourse(courseData)
        const gs = groupData.data
        setGroups(gs)
        const teacherIds = new Set(gs.map((g) => g.teacher.id))
        setTeachers(teacherData.data.filter((t) => teacherIds.has(t.id)))
        setCourseNotFound(false)
      } catch {
        setCourseNotFound(true)
        addToast('Kurs məlumatları yüklənmədi', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) load()
  }, [courseId])

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (courseNotFound || !course) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4">
        <p className="text-text-base/50">Kurs tapılmadı</p>
        <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
          Geri
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')} className="self-start">
        <ArrowLeft size={14} />
        Geri
      </Button>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-base">{course.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-base/60">
              <span>👥 {groups.length} qrup</span>
              <span>👨‍🏫 {teachers.length} müəllim</span>
              {course.description && (
                <span className="line-clamp-1 max-w-md">{course.description}</span>
              )}
            </div>
          </div>
          <Badge status={course.status} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-neu px-4 py-2 text-sm font-bold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary ${activeTab === tab.key ? 'bg-primary text-white shadow-neu-sm' : 'text-text-base/60 shadow-neu hover:text-text-base'}`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'groups' && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-surface-dark/20 px-5 py-4">
            <h2 className="font-bold text-text-base">Qruplar ({groups.length})</h2>
          </div>
          <div className="divide-y divide-surface-dark/20">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/admin/groups/${group.id}`)}
                className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-surface-dark/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-base">{group.name}</p>
                  <p className="mt-1 text-xs text-text-base/50">
                    👨‍🏫 {group.teacher.full_name ?? `${group.teacher.name} ${group.teacher.surname}`}
                  </p>
                  <p className="text-xs text-text-base/50">👥 {group.students_count} tələbə</p>
                </div>
                <Badge status={group.status} />
              </button>
            ))}
            {!groups.length && (
              <p className="px-5 py-8 text-center text-sm text-text-base/40">Bu kurs üçün qrup tapılmadı.</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'teachers' && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-surface-dark/20 px-5 py-4">
            <h2 className="font-bold text-text-base">Müəllimlər ({teachers.length})</h2>
          </div>
          {teachers.length ? (
            <div className="divide-y divide-surface-dark/20">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-text-base">
                        {teacher.full_name ?? `${teacher.name} ${teacher.surname}`}
                      </p>
                      <Badge status={teacher.status} />
                    </div>
                    {teacher.specialization && (
                      <p className="mt-0.5 text-xs text-text-base/50">{teacher.specialization}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-text-base/50">
                      <span>📧 {teacher.email}</span>
                      {teacher.phone && <span>📞 {teacher.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-text-base/40">Bu kurs üçün müəllim tapılmadı.</p>
          )}
        </Card>
      )}
    </div>
  )
}
