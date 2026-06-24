import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CalendarDays, Save, CheckCircle, ArrowLeft } from 'lucide-react'
import { ROUTES } from '../constants/routes'
import { groupsApi } from '../api/groups'
import { lessonsApi } from '../api/lessons'
import { teacherPortalApi } from '../api/teacherPortal'
import type { Group, GroupStudent, GroupLessonItem, CreateGradePayload } from '../types'
import Spinner from '../components/ui/Spinner'

interface GradeRecord {
  studentId: number
  studentName: string
  studentSurname: string
  attendanceStatus: string
  score: number | null
  existingGradeId?: number
}

export default function Grades() {
  const { id: lessonIdParam } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [lessons, setLessons] = useState<GroupLessonItem[]>([])

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(lessonIdParam ? Number(lessonIdParam) : null)
  const [students, setStudents] = useState<GroupStudent[]>([])
  const [records, setRecords] = useState<GradeRecord[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [currentLesson, setCurrentLesson] = useState<{ topic: string; date: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setTeacherId(me.id)
        const res = await groupsApi.list({ teacher_id: me.id })
        setGroups(res.data ?? [])
        if (res.data.length > 0 && !selectedLessonId) {
          setSelectedGroupId(res.data[0].id)
        }
      } catch {
        setError('Məlumatlar yüklənə bilmədi')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedGroupId) return
    const load = async () => {
      try {
        const data = await lessonsApi.getByGroup(selectedGroupId)
        setLessons(data)
        if (data.length > 0 && !selectedLessonId) {
          setSelectedLessonId(data[0].id)
        }
      } catch {
        setError('Dərslər yüklənə bilmədi')
        setLessons([])
      }
    }
    load()
  }, [selectedGroupId])

  useEffect(() => {
    if (!selectedLessonId) {
      setStudents([])
      setRecords([])
      setCurrentLesson(null)
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        const [lessonData, atts, grades] = await Promise.all([
          lessonsApi.getById(selectedLessonId),
          lessonsApi.getAttendances(selectedLessonId),
          lessonsApi.getGrades(selectedLessonId),
        ])

        setCurrentLesson({ topic: lessonData.topic, date: lessonData.lesson_date })

        if (!selectedGroupId && lessonData.group_id) {
          setSelectedGroupId(lessonData.group_id)
        }

        const group = await groupsApi.get(lessonData.group_id)
        const studentList = group.students ?? []
        setStudents(studentList)

        const attMap = new Map(atts.map((a) => [a.student_id, a.status]))
        const gradeMap = new Map(grades.map((g) => [g.student_id, g]))

        setRecords(
          studentList.map((s) => ({
            studentId: s.id,
            studentName: s.name,
            studentSurname: s.surname,
            attendanceStatus: attMap.get(s.id) ?? 'present',
            score: gradeMap.get(s.id)?.score ?? null,
            existingGradeId: gradeMap.get(s.id)?.id,
          })),
        )
      } catch {
        setError('Qiymət məlumatları yüklənə bilmədi')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedLessonId])

  const handleSave = async () => {
    if (!selectedLessonId) return
    setSaveStatus('saving')
    try {
      await Promise.all(
        records.map((r) => {
          const payload: CreateGradePayload = {
            student_id: r.studentId,
            score: r.score ?? 0,
            max_score: 100,
            teacher_note: null,
          }
          if (r.existingGradeId) {
            return lessonsApi.updateGrade(r.existingGradeId, payload)
          }
          return lessonsApi.createGrade(selectedLessonId, payload)
        }),
      )
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setError('Qiymətlər saxlanıla bilmədi')
      setSaveStatus('idle')
    }
  }

  const allScores = records
    .filter((r) => r.score !== null)
    .map((r) => r.score as number)

  const avg = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : null
  const highest = allScores.length ? Math.max(...allScores) : null
  const lowest = allScores.length ? Math.min(...allScores) : null

  if (loading && !records.length) return <Spinner />

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-text-base">Qiymət Daxil Et</h1>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      <div className="rounded-neu bg-surface shadow-neu-sm p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Qrup</label>
            <select
              value={selectedGroupId ?? ''}
              onChange={(e) => {
                setSelectedGroupId(Number(e.target.value))
                setSelectedLessonId(null)
              }}
              className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Dərs</label>
            <select
              value={selectedLessonId ?? ''}
              onChange={(e) => setSelectedLessonId(Number(e.target.value))}
              className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.lesson_date} — {l.topic}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-base/50 mb-1 block">Tarix</label>
            <div className="border border-surface-dark/20 rounded-lg px-3 py-2 text-sm bg-gray-50 text-text-base/50 flex items-center gap-2">
              <CalendarDays size={15} className="text-text-base/50" />
              {currentLesson?.date ? new Date(currentLesson.date).toLocaleDateString('az-AZ') : '—'}
            </div>
          </div>
        </div>
      </div>

      {currentLesson && (
        <div className="flex items-center gap-3 mb-4 px-1">
          <span className="text-sm font-medium text-text-base">
            {groups.find((g) => g.id === selectedGroupId)?.name}
          </span>
          <span className="text-text-base/50">·</span>
          <span className="text-sm text-text-base/50">{currentLesson.topic}</span>
          <span className="text-text-base/50">·</span>
          <span className="text-sm text-text-base/50">{new Date(currentLesson.date).toLocaleDateString('az-AZ')}</span>
        </div>
      )}

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="px-3 py-3 text-center text-xs font-medium text-text-base/50 uppercase tracking-wide">#</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-base/50 uppercase tracking-wide">Ad + Soyad</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-base/50 uppercase tracking-wide">Davamiyyət</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-text-base/50 uppercase tracking-wide">Bal (0-100)</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-base/50 uppercase tracking-wide">Faiz (%)</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.studentId} className="border-b border-surface-dark/20 last:border-0">
                <td className="px-3 py-1.5 text-center text-xs text-text-base/50 font-medium select-none">{index + 1}</td>
                <td className="px-4 py-1.5 text-sm text-text-base">{record.studentName} {record.studentSurname}</td>
                <td className="px-4 py-1.5 text-sm">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    record.attendanceStatus === 'present' ? 'bg-green-100 text-green-700' :
                    record.attendanceStatus === 'late' ? 'bg-amber-100 text-amber-700' :
                    record.attendanceStatus === 'absent_excused' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {record.attendanceStatus === 'present' ? 'İştirak edib' :
                     record.attendanceStatus === 'late' ? 'Gecikdi' :
                     record.attendanceStatus === 'absent_excused' ? 'Qaib (üzrlü)' :
                     'Qaib (üzrsüz)'}
                  </span>
                </td>
                <td className="px-4 py-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={record.score ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value)
                      setRecords((prev) => prev.map((r) =>
                        r.studentId === record.studentId ? { ...r, score: val } : r,
                      ))
                    }}
                    className="w-full text-center text-sm border border-surface-dark/20 rounded px-1.5 py-0.5 bg-white focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-1.5 text-sm font-medium text-primary text-center">
                  {record.score !== null ? `${Math.round((record.score / 100) * 100)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-surface-dark/20 bg-surface-light px-4 py-3 text-sm text-text-base/50">
          <div className="flex items-center gap-4">
            <span>Ortalama: <strong className="text-text-base">{avg ?? '—'}%</strong></span>
            <span>Ən yüksək: <strong className="text-green-600">{highest ?? '—'}</strong></span>
            <span>Ən aşağı: <strong className="text-red-500">{lowest ?? '—'}</strong></span>
            <span className="text-xs">
              ({allScores.length} / {records.length} tələbə qiymətləndirildi)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            saveStatus === 'saved'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          } disabled:opacity-60`}
        >
          {saveStatus === 'saving' ? 'Saxlanılır...' : saveStatus === 'saved' ? <><CheckCircle size={15} /> Saxlanıldı</> : <><Save size={15} /> Saxla</>}
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            if (selectedGroupId) {
              navigate(`${ROUTES.TEACHER_GROUP(String(selectedGroupId))}?tab=lessons`)
            } else {
              navigate(ROUTES.TEACHER_GROUPS)
            }
          }}
          className="text-sm text-text-base/50 hover:text-text-base flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={15} /> Qrup Detaylarına Qayıt
        </button>
      </div>
    </div>
  )
}
