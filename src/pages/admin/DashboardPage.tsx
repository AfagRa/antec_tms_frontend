import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, UserCheck, Users } from 'lucide-react'
import { coursesApi } from '@/api/courses'
import { groupsApi } from '@/api/groups'
import { teachersApi } from '@/api/teachers'
import { studentsApi } from '@/api/students'
import type { Course, Group, Teacher, Student } from '@/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [courseList, groupList, teacherList, studentList] = await Promise.all([
          coursesApi.list(),
          groupsApi.list(),
          teachersApi.list(),
          studentsApi.list(),
        ])
        setCourses(courseList.data)
        setGroups(groupList.data)
        setTeachers(teacherList.data)
        setStudents(studentList.data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-base">Dashboard</h1>
          <p className="mt-1 text-sm text-text-base/50">Sistemin ümumi vəziyyəti</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/courses')}>
            Kurslar
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/groups')}>
            Qruplar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Kurslar" value={courses.length} icon={<BookOpen size={22} />} loading={loading} />
        <StatCard title="Qruplar" value={groups.length} icon={<Users size={22} />} color="text-success" loading={loading} />
        <StatCard title="Müəllimlər" value={teachers.length} icon={<UserCheck size={22} />} color="text-warning" loading={loading} />
        <StatCard title="Tələbələr" value={students.length} icon={<GraduationCap size={22} />} color="text-primary" loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-surface-dark/20 px-5 py-4">
            <h2 className="font-bold text-text-base">Son qruplar</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/groups')}>
              Hamısı
            </Button>
          </div>
          <div className="divide-y divide-surface-dark/20">
            {groups.slice(0, 5).map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/admin/groups/${group.id}`)}
                className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-surface-dark/10"
              >
                <div>
                  <p className="text-sm font-bold text-text-base">{group.name}</p>
                  <p className="text-xs text-text-base/50">
                    {group.course.name} · {group.teacher.full_name ?? `${group.teacher.name} ${group.teacher.surname}`}
                  </p>
                </div>
                <Badge status={group.status} />
              </button>
            ))}
            {!groups.length && <p className="px-5 py-8 text-center text-sm text-text-base/40">Qrup tapılmadı.</p>}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-surface-dark/20 px-5 py-4">
            <h2 className="font-bold text-text-base">Aktiv kurslar</h2>
          </div>
          <div className="divide-y divide-surface-dark/20">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-text-base">{course.name}</p>
                  <p className="text-xs text-text-base/50 line-clamp-1">{course.description ?? 'Təsvir yoxdur'}</p>
                </div>
                <Badge status={course.status} />
              </div>
            ))}
            {!courses.length && <p className="px-5 py-8 text-center text-sm text-text-base/40">Kurs tapılmadı.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
