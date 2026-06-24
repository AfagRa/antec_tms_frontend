import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react'
import { groupsApi } from '@/api/groups'
import { studentsApi } from '@/api/students'
import { lessonsApi } from '@/api/lessons'
import type { AttendanceRecord, Grade, Group, GroupStudent, Lesson, Material, Student } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import { useToast } from '@/hooks/useToast'

type Tab = 'students' | 'lessons' | 'attendance' | 'grades' | 'materials'

const tabs: { key: Tab; label: string; emoji: string }[] = [
  { key: 'students', label: 'Tələbələr', emoji: '👥' },
  { key: 'lessons', label: 'Dərslər', emoji: '📚' },
  { key: 'attendance', label: 'Davamiyyət', emoji: '✅' },
  { key: 'grades', label: 'Qiymətlər', emoji: '🎯' },
  { key: 'materials', label: 'Materiallar', emoji: '📎' },
]

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('students')
  const [tabLoading, setTabLoading] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [addingStudent, setAddingStudent] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<GroupStudent | null>(null)
  const [removing, setRemoving] = useState(false)

  const groupId = Number(id)

  const loadGroup = async () => {
    setLoading(true)
    try {
      const data = await groupsApi.get(groupId)
      setGroup(data)
    } catch {
      addToast('Qrup məlumatları yüklənmədi', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroup()
  }, [groupId])

  useEffect(() => {
    if (!group) return

    const loadTab = async () => {
      setTabLoading(true)
      try {
        if (activeTab === 'lessons') setLessons(await lessonsApi.list(groupId))
        if (activeTab === 'attendance') setAttendance(await lessonsApi.attendance(groupId))
        if (activeTab === 'grades') setGrades(await lessonsApi.grades(groupId))
        if (activeTab === 'materials') setMaterials(await lessonsApi.materials(groupId))
      } catch {
        addToast('Tab məlumatları yüklənmədi', 'error')
      } finally {
        setTabLoading(false)
      }
    }

    loadTab()
  }, [activeTab, group, groupId])

  const openAddStudent = async () => {
    try {
      const allStudents = await studentsApi.list()
      const existing = new Set(group?.students?.map((student) => student.id) ?? [])
      setAvailableStudents(allStudents.data.filter((student) => !existing.has(student.id)))
      setStudentSearch('')
      setSelectedStudentId(null)
      setAddStudentOpen(true)
    } catch {
      addToast('Tələbə siyahısı yüklənmədi', 'error')
    }
  }

  const filteredStudents = useMemo(
    () =>
      availableStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.surname.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.email.toLowerCase().includes(studentSearch.toLowerCase()),
      ),
    [availableStudents, studentSearch],
  )

  const handleAddStudent = async () => {
    if (!selectedStudentId) return
    setAddingStudent(true)
    try {
      await groupsApi.addStudent(groupId, selectedStudentId)
      addToast('Tələbə qrupa əlavə edildi', 'success')
      setAddStudentOpen(false)
      loadGroup()
    } catch {
      addToast('Tələbə əlavə edilə bilmədi', 'error')
    } finally {
      setAddingStudent(false)
    }
  }

  const handleRemoveStudent = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await groupsApi.removeStudent(groupId, removeTarget.id)
      addToast('Tələbə qrupdan çıxarıldı', 'success')
      setRemoveTarget(null)
      loadGroup()
    } catch {
      addToast('Tələbə çıxarıla bilmədi', 'error')
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4">
        <p className="text-text-base/50">Qrup tapılmadı</p>
        <Button variant="secondary" onClick={() => navigate('/admin/groups')}>
          Geri
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/groups')} className="self-start">
        <ArrowLeft size={14} />
        Geri
      </Button>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-base">{group.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-base/60">
              <span>📚 {group.course.name}</span>
              <span>🎓 {group.teacher.full_name ?? `${group.teacher.name} ${group.teacher.surname}`}</span>
              <span>📅 {new Date(group.start_date).toLocaleDateString('az-AZ')}</span>
              <span>👥 {group.students_count} tələbə</span>
            </div>
          </div>
          <Badge status={group.status} />
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

      {activeTab === 'students' && (
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-bold text-text-base">Tələbələr ({group.students?.length ?? 0})</h2>
            <Button size="sm" icon={<UserPlus size={14} />} onClick={openAddStudent}>
              Tələbə əlavə et
            </Button>
          </div>

          {!group.students?.length ? (
            <p className="py-8 text-center text-sm text-text-base/40">Tələbə yoxdur</p>
          ) : (
            <div className="space-y-2">
              {group.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-neu px-4 py-3 shadow-neu-sm">
                  <div>
                    <p className="text-sm font-bold text-text-base">{student.full_name ?? `${student.name} ${student.surname}`}</p>
                    <p className="text-xs text-text-base/50">{student.email ?? ''}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setRemoveTarget(student)}>
                    <UserMinus size={13} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'lessons' && (
        <Table
          columns={[
            { key: 'date', header: 'Tarix', render: (lesson: Lesson) => <span className="font-mono text-xs">{new Date(lesson.date).toLocaleDateString('az-AZ')}</span> },
            { key: 'topic', header: 'Mövzu', render: (lesson: Lesson) => <span className="font-bold">{lesson.topic}</span> },
            { key: 'status', header: 'Status', render: (lesson: Lesson) => <Badge status={lesson.status} /> },
          ]}
          data={lessons}
          loading={tabLoading}
          rowKey={(lesson) => lesson.id}
          emptyMessage="Dərs tapılmadı"
        />
      )}

      {activeTab === 'attendance' && (
        <Table
          columns={[
            { key: 'student', header: 'Tələbə', render: (record: AttendanceRecord) => `${record.studentName} ${record.studentSurname}` },
            { key: 'lesson', header: 'Tarix', render: (record: AttendanceRecord) => <span className="font-mono text-xs">{record.lessonId}</span> },
            {
              key: 'status',
              header: 'Davamiyyət',
              render: (record: AttendanceRecord) => {
                const config: Record<string, { status: string; label: string }> = {
                  present: { status: 'active', label: 'İştirak etdi' },
                  late: { status: 'scheduled', label: 'Gecikdi' },
                  absent_excused: { status: 'inactive', label: 'Qaib (üzrlü)' },
                  absent_unexcused: { status: 'cancelled', label: 'Qaib (üzrsüz)' },
                }
                const c = config[record.status] ?? { status: 'inactive', label: 'Bilinmir' }
                return <Badge status={c.status as any} label={c.label} />
              },
            },
          ]}
          data={attendance}
          loading={tabLoading}
          rowKey={(record) => record.id}
          emptyMessage="Davamiyyət məlumatı tapılmadı"
        />
      )}

      {activeTab === 'grades' && (
        <Table
          columns={[
            { key: 'student', header: 'Tələbə', render: (grade: Grade) => grade.student.full_name },
            { key: 'lesson', header: 'Dərs', render: (grade: Grade) => grade.lesson.topic },
            { key: 'score', header: 'Qiymət', render: (grade: Grade) => <span className="font-mono">{grade.score} / {grade.max_score}</span> },
            {
              key: 'percent',
              header: '%',
              render: (grade: Grade) => {
                if (grade.max_score === 0) return <span className="text-text-base/40">—</span>
                const percent = Math.round((grade.score / grade.max_score) * 100)
                const className = percent >= 70 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-danger'
                return <span className={`font-bold ${className}`}>{percent}%</span>
              },
            },
          ]}
          data={grades}
          loading={tabLoading}
          rowKey={(grade) => grade.id}
          emptyMessage="Qiymət tapılmadı"
        />
      )}

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tabLoading ? (
            <div className="py-12 text-center text-text-base/40">Yüklənir...</div>
          ) : materials.length ? (
            materials.map((material) => (
              <a key={material.id} href={material.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-neu border border-surface-dark/30 bg-surface p-4 shadow-neu transition-all hover:shadow-neu-inset">
                <span className="text-2xl" aria-hidden>
                  {material.type === 'pdf' ? '📄' : material.type === 'video' ? '🎬' : '🔗'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-base">{material.title}</p>
                  <p className="mt-0.5 text-xs text-text-base/50">{new Date(material.created_at).toLocaleDateString('az-AZ')}</p>
                </div>
              </a>
            ))
          ) : (
            <p className="py-12 text-center text-sm text-text-base/40">Material tapılmadı</p>
          )}
        </div>
      )}

      <Modal isOpen={addStudentOpen} onClose={() => setAddStudentOpen(false)} title="Tələbə əlavə et">
        <div className="space-y-4">
          <Input placeholder="Ad / email ilə axtar..." value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} />
          <div className="max-h-72 overflow-y-auto space-y-1 rounded-neu-inset-sm p-2">
            {filteredStudents.length ? (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full rounded-neu-sm px-3 py-2 text-left text-sm font-medium transition-all ${selectedStudentId === student.id ? 'bg-primary text-white shadow-neu-sm' : 'text-text-base hover:shadow-neu-sm'}`}
                >
                  {student.full_name ?? `${student.name} ${student.surname}`} — {student.email}
                </button>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-text-base/40">Tələbə tapılmadı</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAddStudentOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleAddStudent} loading={addingStudent} disabled={!selectedStudentId}>
              Əlavə et
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveStudent}
        loading={removing}
        title="Tələbəni qrupdan çıxar?"
        message={`${removeTarget?.full_name ?? `${removeTarget?.name} ${removeTarget?.surname}`} bu qrupdan çıxarılacaq.`}
      />
    </div>
  )
}
