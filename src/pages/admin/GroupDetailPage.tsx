import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react'
import { groupsApi } from '@/api/groups'
import { studentsApi } from '@/api/students'
import { lessonsApi } from '@/api/lessons'
import { materialsApi } from '@/api/materials'
import { getFileUrl } from '@/api/client'
import { reportsApi, type AttendanceReportDetail, type GradesReportDetail } from '@/api/reports'
import type { Group, GroupLessonItem, GroupStudent, Material, Student } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Spinner from '@/components/ui/Spinner'
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
  const [lessons, setLessons] = useState<GroupLessonItem[]>([])
  const [attendance, setAttendance] = useState<AttendanceReportDetail[]>([])
  const [grades, setGrades] = useState<GradesReportDetail[]>([])
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
        if (activeTab === 'lessons') setLessons(await lessonsApi.getByGroup(groupId))
        if (activeTab === 'attendance') {
          const result = await reportsApi.attendance(groupId)
          setAttendance(result.details)
        }
        if (activeTab === 'grades') {
          const result = await reportsApi.grades(groupId)
          setGrades(result.details)
        }
        if (activeTab === 'materials') setMaterials(await materialsApi.getByGroup(groupId))
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
        <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-surface-dark/20 bg-surface-light">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tarix</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Mövzu</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {tabLoading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-text-base/40"><Spinner size="lg" /></td></tr>
                ) : lessons.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-text-base/40">Dərs tapılmadı</td></tr>
                ) : (
                  lessons.map((lesson, index) => (
                    <tr key={lesson.id} className="border-b border-surface-dark/20 last:border-0 transition-colors hover:bg-surface-dark/10">
                      <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono text-text-base">{new Date(lesson.lesson_date).toLocaleDateString('az-AZ')}</td>
                      <td className="px-4 py-3 text-sm font-bold text-text-base">{lesson.topic}</td>
                      <td className="px-4 py-3"><Badge status={lesson.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-surface-dark/20 bg-surface-light">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tələbə</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-text-base/60">İştirak</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-text-base/60">Qaib</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-text-base/60">Gecikmə</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-text-base/60">Üzrlü</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-text-base/60">%</th>
                </tr>
              </thead>
              <tbody>
                {tabLoading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-text-base/40"><Spinner size="lg" /></td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-text-base/40">Davamiyyət məlumatı tapılmadı</td></tr>
                ) : (
                  attendance.map((item, index) => {
                    const pct = item.attendancePercentage
                    const pctClass = pct >= 70 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger'
                    return (
                      <tr key={item.studentId} className="border-b border-surface-dark/20 last:border-0 transition-colors hover:bg-surface-dark/10">
                        <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-text-base">{item.studentName}</td>
                        <td className="px-4 py-3 text-center text-sm text-text-base">{item.present}</td>
                        <td className="px-4 py-3 text-center text-sm text-text-base">{item.absent}</td>
                        <td className="px-4 py-3 text-center text-sm text-text-base">{item.late}</td>
                        <td className="px-4 py-3 text-center text-sm text-text-base">{item.excused}</td>
                        <td className={`px-4 py-3 text-right text-sm font-bold ${pctClass}`}>{pct.toFixed(1)}%</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-surface-dark/20 bg-surface-light">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tələbə</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-text-base/60">Qiymətlər</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-text-base/60">Cəmi</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-text-base/60">%</th>
                </tr>
              </thead>
              <tbody>
                {tabLoading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-text-base/40"><Spinner size="lg" /></td></tr>
                ) : grades.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-text-base/40">Qiymət tapılmadı</td></tr>
                ) : (
                  grades.map((item, index) => {
                    const percent = item.totalMaxScore === 0 ? null : Math.round(item.percentage)
                    const pClass = percent === null ? 'text-text-base/40' : percent >= 70 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-danger'
                    return (
                      <tr key={item.studentId} className="border-b border-surface-dark/20 last:border-0 transition-colors hover:bg-surface-dark/10">
                        <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-bold text-text-base">{item.studentName}</td>
                        <td className="px-4 py-3 text-center text-sm text-text-base">{item.gradeCount}</td>
                        <td className="px-4 py-3 text-right text-sm font-mono text-text-base">{item.totalScore} / {item.totalMaxScore}</td>
                        <td className="px-4 py-3 text-right text-sm"><span className={`font-bold ${pClass}`}>{percent !== null ? `${percent}%` : '—'}</span></td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-surface-dark/20 bg-surface-light">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Başlıq</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tip</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {tabLoading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-text-base/40"><Spinner size="lg" /></td></tr>
                ) : materials.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-text-base/40">Material tapılmadı</td></tr>
                ) : (
                  materials.map((material, index) => (
                    <tr key={material.id} className="border-b border-surface-dark/20 last:border-0 transition-colors hover:bg-surface-dark/10">
                      <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                      <td className="px-4 py-3">
                        <a href={material.url || getFileUrl(material.file_path)!} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline">
                          {material.title}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-text-base/50">
                        {material.type?.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-base">
                        {new Date(material.created_at).toLocaleDateString('az-AZ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
