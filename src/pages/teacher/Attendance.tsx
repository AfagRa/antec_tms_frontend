import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { groupsApi } from '../../api/groups'
import { lessonsApi } from '../../api/lessons'
import type { GroupStudent, LessonAttendanceItem, CreateAttendancePayload } from '../../types'
import Spinner from '../../components/ui/Spinner'

type SaveState = 'idle' | 'saving' | 'done'

interface Record {
  studentId: number
  studentName: string
  studentSurname: string
  status: string
  minutesLate: number
  reason: string
  teacherNote: string
}

export default function Attendance() {
  const { id: lessonIdParam } = useParams()
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lessonInfo, setLessonInfo] = useState<{ groupId: number; topic: string; date: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!lessonIdParam) return
      try {
        const lesson = await lessonsApi.getById(Number(lessonIdParam))
        setLessonInfo({
          groupId: lesson.group_id,
          topic: lesson.topic,
          date: lesson.lesson_date,
        })

        const [group, atts] = await Promise.all([
          groupsApi.get(lesson.group_id),
          lessonsApi.getAttendances(Number(lessonIdParam)),
        ])

        const students: GroupStudent[] = group.students ?? []
        const attMap = new Map(atts.map((a) => [a.student_id, a]))

        setRecords(
          students.map((s) => {
            const existing = attMap.get(s.id)
            return {
              studentId: s.id,
              studentName: s.name,
              studentSurname: s.surname,
              status: existing?.status ?? 'present',
              minutesLate: existing?.minutes_late ?? 0,
              reason: existing?.reason ?? '',
              teacherNote: '',
            }
          }),
        )
      } catch (err) {
        console.warn('Failed to load attendance data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lessonIdParam])

  const handleSave = async () => {
    if (!lessonIdParam) return
    setSaveState('saving')
    try {
      await Promise.all(
        records.map((record) => {
          const payload: CreateAttendancePayload = {
            student_id: record.studentId,
            status: record.status,
            minutes_late: record.status === 'late' ? record.minutesLate : null,
            reason: record.reason || null,
            teacher_note: record.teacherNote || null,
          }
          return lessonsApi.createAttendance(Number(lessonIdParam), payload)
        }),
      )
      setSaveState('done')
    } catch (err) {
      console.error('Failed to save attendance', err)
      setSaveState('idle')
    }
  }

  useEffect(() => {
    if (saveState === 'done') {
      const t = setTimeout(() => setSaveState('idle'), 3000)
      return () => clearTimeout(t)
    }
  }, [saveState])

  const updateRecord = (studentId: number, field: keyof Record, value: unknown) => {
    setRecords((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r)))
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-text-base">Davamiyyət Daxil Et</h1>

      {lessonInfo && (
        <div className="mb-4 rounded-neu bg-surface px-4 py-3 shadow-neu-inset-sm">
          <p className="text-sm text-text-base">
            <span className="font-medium">Dərs:</span> {lessonInfo.topic}
            <span className="mx-3 text-text-base/50">|</span>
            <span className="font-medium">Tarix:</span>{' '}
            {new Date(lessonInfo.date).toLocaleDateString('az-AZ')}
          </p>
        </div>
      )}

      {saveState === 'done' && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          Davamiyyət uğurla yadda saxlanıldı!
        </div>
      )}

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-max w-full">
          <thead>
            <tr className="border-b border-surface-dark/20 bg-surface-light">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Ad + Soyad</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Səbəb (varsa)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">Müəllim Qeydi (optional)</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.studentId} className="border-b border-surface-dark/20 last:border-0">
                <td className="px-4 py-3 text-sm text-text-base">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-text-base">
                  {record.studentName} {record.studentSurname}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {([
                      { value: 'present', abbr: 'İ/E', activeColor: 'bg-green-100 border-green-400 text-green-700' },
                      { value: 'late', abbr: 'G', activeColor: 'bg-amber-100 border-amber-400 text-amber-700' },
                      { value: 'absent_excused', abbr: 'Q/Ü', activeColor: 'bg-blue-100 border-blue-400 text-blue-700' },
                      { value: 'absent_unexcused', abbr: 'Q', activeColor: 'bg-red-100 border-red-400 text-red-700' },
                    ] as const).map((opt) => (
                      <label
                        key={opt.value}
                        className={`w-9 h-8 rounded-md text-xs font-bold border-2 flex items-center justify-center cursor-pointer transition-all cursor-pointer ${
                          record.status === opt.value
                            ? opt.activeColor
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={record.status === opt.value}
                          onChange={() => updateRecord(record.studentId, 'status', opt.value)}
                          className="sr-only"
                        />
                        {opt.abbr}
                      </label>
                    ))}
                    {record.status === 'late' && (
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={record.minutesLate || ''}
                        onChange={(e) => updateRecord(record.studentId, 'minutesLate', Number(e.target.value))}
                        className="w-14 text-xs border border-amber-300 rounded px-1.5 py-0.5 text-center focus:ring-1 focus:ring-amber-400 outline-none bg-amber-50"
                        placeholder="dəq"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={record.reason ?? ''}
                    placeholder="Səbəb"
                    onChange={(e) => updateRecord(record.studentId, 'reason', e.target.value)}
                    className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </td>
                <td className="px-4 py-3">
                  <textarea
                    rows={1}
                    value={record.teacherNote ?? ''}
                    placeholder="optional"
                    onChange={(e) => updateRecord(record.studentId, 'teacherNote', e.target.value)}
                    className="w-full border border-surface-dark/20 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link
          to={lessonInfo ? `${ROUTES.TEACHER_GROUP(String(lessonInfo.groupId))}?tab=lessons` : ROUTES.TEACHER_GROUPS}
          className="text-sm text-text-base/50 hover:text-text-base"
        >
          ← Dərslərə Qayıt
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 cursor-pointer"
          >
            {saveState === 'saving' ? 'Saxlanılır...' : 'Yadda saxla'}
          </button>
          {lessonIdParam && (
            <Link
              to={ROUTES.TEACHER_GRADES(lessonIdParam)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Növbəti: Qiymətləri Daxil Et →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
