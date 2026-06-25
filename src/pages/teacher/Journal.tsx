import React, { useState, useEffect, useCallback } from 'react'
import { Save, Download, Plus } from 'lucide-react'
import { teacherPortalApi } from '../../api/teacherPortal'
import { groupsApi } from '../../api/groups'
import { lessonsApi } from '../../api/lessons'
import type { Group, GroupStudent, GroupLessonItem, LessonAttendanceItem, LessonGradeItem, CreateAttendancePayload, CreateGradePayload, GradeCategory } from '../../types'
import type { JournalCell } from '../../types'
import Spinner from '../../components/ui/Spinner'
import { AttendanceSegment } from '../../components/ui/AttendanceSegment'
import { exportJournalToExcel } from '../../utils/exportJournal'

const CATEGORY_OPTIONS = [
  { value: 'ders', label: 'Dərs' },
  { value: 'lab', label: 'Lab' },
  { value: 'modul', label: 'Modul' },
  { value: 'final', label: 'Final' },
]

interface CellData {
  attStatus: JournalCell['attendance']
  minutesLate: number
  grade: number | null
  existingAttId?: number
  existingGradeId?: number
}

type JournalMatrix = Record<number, Record<number, CellData>>

export default function TeacherJournal() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [students, setStudents] = useState<GroupStudent[]>([])
  const [lessons, setLessons] = useState<GroupLessonItem[]>([])
  const [matrix, setMatrix] = useState<JournalMatrix>({})
  const [columnCategories, setColumnCategories] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<GradeCategory | 'all'>('all')
  const [toast, setToast] = useState<'idle' | 'done'>('idle')
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [newLessonDate, setNewLessonDate] = useState('')
  const [newLessonTopic, setNewLessonTopic] = useState('')
  const [addingLesson, setAddingLesson] = useState(false)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setTeacherId(me.id)
        const res = await groupsApi.list({ teacher_id: me.id })
        const grps = res.data ?? []
        setGroups(grps)
        if (grps.length > 0) setSelectedGroupId(grps[0].id)
      } catch (err) {
        console.warn('Failed to load groups', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedGroupId) return
    const load = async () => {
      setLoading(true)
      try {
        const [group, lessonList] = await Promise.all([
          groupsApi.get(selectedGroupId),
          lessonsApi.getByGroup(selectedGroupId),
        ])
        setStudents(group.students ?? [])
        const sorted = [...lessonList].sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime())
        setLessons(sorted)

        const attsByLesson = await Promise.all(
          lessonList.map((l) =>
            lessonsApi.getAttendances(l.id).catch(() => [] as LessonAttendanceItem[]),
          ),
        )
        const gradesByLesson = await Promise.all(
          lessonList.map((l) =>
            lessonsApi.getGrades(l.id).catch(() => [] as LessonGradeItem[]),
          ),
        )

        const newMatrix: JournalMatrix = {}
        const studentsList = group.students ?? []

        lessonList.forEach((lesson, li) => {
          const atts = attsByLesson[li]
          const grades = gradesByLesson[li]
          const attMap = new Map(atts.map((a) => [a.student_id, a]))
          const gradeMap = new Map(grades.map((g) => [g.student_id, g]))

          studentsList.forEach((s) => {
            if (!newMatrix[s.id]) newMatrix[s.id] = {}
            const att = attMap.get(s.id)
            const grade = gradeMap.get(s.id)
            newMatrix[s.id][lesson.id] = {
              attStatus: att ? attStatusToJournalCode(att.status) as JournalCell['attendance'] : null,
              minutesLate: att?.minutes_late ?? 0,
              grade: grade?.score ?? null,
              existingAttId: att?.id,
              existingGradeId: grade?.id,
            }
          })
        })

        setMatrix(newMatrix)

        const cats: Record<number, string> = {}
        lessonList.forEach((l) => { cats[l.id] = 'ders' })
        setColumnCategories(cats)
      } catch (err) {
        console.warn('Failed to load journal data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedGroupId])

  useEffect(() => {
    if (toast === 'done') {
      const t = setTimeout(() => setToast('idle'), 2000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const getCell = useCallback(
    (studentId: number, lessonId: number): CellData =>
      matrix[studentId]?.[lessonId] ?? { attStatus: null, minutesLate: 0, grade: null },
    [matrix],
  )

  const setCell = useCallback(
    (studentId: number, lessonId: number, patch: Partial<CellData>) => {
      setMatrix((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [lessonId]: { ...prev[studentId]?.[lessonId], ...patch },
        },
      }))
    },
    [],
  )

  const handleBulkPresent = (lessonId: number) => {
    setMatrix((prev) => {
      const next = { ...prev }
      students.forEach((s) => {
        const existing = next[s.id]?.[lessonId]
        next[s.id] = {
          ...next[s.id],
          [lessonId]: {
            attStatus: 'I/E',
            minutesLate: 0,
            grade: existing?.grade ?? null,
            existingAttId: existing?.existingAttId,
            existingGradeId: existing?.existingGradeId,
          },
        }
      })
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedGroupId) return
    setSaving(true)
    try {
      const ops: Promise<unknown>[] = []

      lessons.forEach((lesson) => {
        students.forEach((student) => {
          const cell = getCell(student.id, lesson.id)

          if (cell.attStatus || cell.grade !== null) {
            const attPayload: CreateAttendancePayload = {
              student_id: student.id,
              status: cell.attStatus ? journalCodeToAttStatus(cell.attStatus) : 'present',
              minutes_late: cell.attStatus === 'G' ? cell.minutesLate : null,
              reason: null,
              teacher_note: null,
            }
            if (cell.existingAttId) {
              ops.push(lessonsApi.updateAttendance(cell.existingAttId, attPayload))
            } else {
              ops.push(lessonsApi.createAttendance(lesson.id, attPayload))
            }
          }

          if (cell.grade !== null) {
            const gradePayload: CreateGradePayload = {
              student_id: student.id,
              score: cell.grade,
              max_score: 100,
              teacher_note: null,
            }
            if (cell.existingGradeId) {
              ops.push(lessonsApi.updateGrade(cell.existingGradeId, gradePayload))
            } else {
              ops.push(lessonsApi.createGrade(lesson.id, gradePayload))
            }
          }
        })
      })

      await Promise.all(ops)
      setLocked(true)
      setToast('done')
    } catch (err) {
      console.error('Failed to save journal', err)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (iso: string): string => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const handleAddNewLesson = async () => {
    if (!newLessonDate || !newLessonTopic.trim() || !selectedGroupId || !teacherId) return
    setAddingLesson(true)
    try {
      await lessonsApi.create({
        group_id: selectedGroupId,
        teacher_id: teacherId,
        lesson_date: new Date(newLessonDate).toISOString(),
        topic: newLessonTopic.trim(),
        status: 'scheduled',
      })
      setShowAddLesson(false)
      setNewLessonDate('')
      setNewLessonTopic('')
      const lessonList = await lessonsApi.getByGroup(selectedGroupId)
      setLessons([...lessonList].sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime()))
    } catch (err) {
      console.error('Dərs əlavə edilə bilmədi:', err)
    } finally {
      setAddingLesson(false)
    }
  }

  const visibleLessons = selectedCategory === 'all'
    ? lessons
    : lessons.filter(l => (columnCategories[l.id] ?? 'ders') === selectedCategory)

  const groupStartDate = groups.find(g => g.id === selectedGroupId)?.start_date
  const lastLessonDate = lessons.length > 0
    ? lessons.reduce((latest, l) => {
        const d = new Date(l.lesson_date)
        return d > latest ? d : latest
      }, new Date(0))
    : null
  const minNewLessonDate = (() => {
    const base = groupStartDate ? new Date(groupStartDate) : new Date('2020-01-01')
    if (!lastLessonDate) return base.toISOString().split('T')[0]
    const nextDay = new Date(lastLessonDate.getTime() + 86400000)
    return new Date(Math.max(base.getTime(), nextDay.getTime())).toISOString().split('T')[0]
  })()

  if (loading) return <Spinner />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-semibold text-text-base mb-4">Jurnal</h1>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label className="text-sm text-text-base/50 mr-2">Qrup seçin:</label>
              <select
                value={selectedGroupId ?? ''}
                onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base focus:ring-2 focus:ring-primary/30 outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="text-sm text-text-base/50 mr-2">Kategoriya:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as GradeCategory | 'all')}
                className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="all">Hamısı</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-neu-sm bg-surface shadow-neu-sm px-3 py-1.5 text-sm text-text-base">{students.length} tələbə</span>
            <span className="rounded-neu-sm bg-surface shadow-neu-sm px-3 py-1.5 text-sm text-text-base">{visibleLessons.length} dərs</span>
            <button
              onClick={() => {
                const grp = groups.find(g => g.id === selectedGroupId)
                if (!grp) return
                exportJournalToExcel(grp.name, students, lessons, matrix, columnCategories, selectedCategory)
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download size={15} />
              Excel Export
            </button>
            <button onClick={handleSave} disabled={saving || locked} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition-all cursor-pointer">
              <Save size={15} />
              {locked ? 'Yadda Saxlandı ✓' : saving ? 'Saxlanılır...' : 'Yadda Saxla'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-neu bg-surface shadow-neu-sm p-0 h-full overflow-hidden">
          <div className="overflow-auto h-full w-full">
            <table className="border-collapse text-sm" style={{ minWidth: `${48 + 180 + visibleLessons.length * 270 + 120 + 80}px` }}>
              <thead>
                <tr>
                  <th colSpan={2} className="sticky left-0 z-30 bg-white border-b border-r-2 border-surface-dark/20 text-xs font-medium text-text-base/50 uppercase tracking-wide min-w-[228px]">
                    <span className="inline-block w-[48px] text-center py-3 align-middle shrink-0">№</span>
                    <span className="inline-block px-4 py-3 align-middle">Tələbənin adı</span>
                  </th>
                  {visibleLessons.map((lesson) => (
                    <th key={lesson.id} colSpan={2} className="border-b border-r border-surface-dark/20 px-2 py-2 text-center font-medium text-text-base text-xs min-w-[140px]">
                      <div className="font-semibold">{formatDate(lesson.lesson_date)}</div>
                      <span className="text-text-base/50 font-normal text-[11px] truncate max-w-[110px] block text-center leading-tight mt-0.5">{lesson.topic}</span>
                    </th>
                  ))}
                  <th className="border-b border-r border-surface-dark/20 px-2 py-2 text-center align-top min-w-[120px]">
                    {!showAddLesson ? (
                      <button
                        onClick={() => setShowAddLesson(true)}
                        disabled={locked}
                        className="flex items-center gap-1 mx-auto text-[11px] font-medium px-2 py-1 rounded-md border border-dashed border-primary text-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Yeni dərs əlavə et"
                      >
                        <Plus size={12} />
                        Yeni Dərs
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1 text-left">
                        <input
                          type="date"
                          value={newLessonDate}
                          onChange={e => setNewLessonDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          min={minNewLessonDate}
                          autoComplete="off"
                          className="w-full text-[11px] border border-surface-dark/20 rounded px-1 py-0.5 focus:border-primary outline-none bg-surface [color-scheme:light]"
                        />
                        <input
                          type="text"
                          value={newLessonTopic}
                          onChange={e => setNewLessonTopic(e.target.value)}
                          placeholder="Mövzu..."
                          maxLength={200}
                          autoComplete="off"
                          className="w-full text-[11px] border border-surface-dark/20 rounded px-1 py-0.5 focus:border-primary outline-none"
                        />
                        <div className="flex gap-1 mt-0.5">
                          <button
                            onClick={handleAddNewLesson}
                            disabled={!newLessonDate || !newLessonTopic.trim() || addingLesson}
                            className="flex-1 text-[10px] py-0.5 rounded bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
                          >
                            {addingLesson ? '...' : 'Əlavə et'}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddLesson(false)
                              setNewLessonDate('')
                              setNewLessonTopic('')
                            }}
                            className="flex-1 text-[10px] py-0.5 rounded border border-surface-dark/20 text-text-base/50 hover:bg-surface-dark/10 transition-colors"
                          >
                            Ləğv et
                          </button>
                        </div>
                      </div>
                    )}
                  </th>
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-3 text-center font-semibold text-slate-700 text-xs uppercase tracking-wide min-w-[80px]">Ümumi %</th>
                </tr>
                <tr>
                  <th colSpan={2} className="sticky left-0 z-30 bg-white border-b border-r-2 border-surface-dark/20 py-1 min-w-[228px]" />
                  {visibleLessons.map((lesson) => (
                    <React.Fragment key={lesson.id}>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center text-xs text-text-base/50 bg-surface-dark/5 w-[150px]">Davamiyyət</th>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center text-xs text-text-base/50 bg-surface-dark/5 w-[120px]">Qiymət</th>
                    </React.Fragment>
                  ))}
                  <th className="border-b border-r border-surface-dark/20 bg-surface-dark/5" />
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-1" />
                </tr>
                <tr>
                  <th colSpan={2} className="sticky left-0 z-30 bg-white border-b border-r-2 border-surface-dark/20 py-1" />
                  {visibleLessons.map((lesson) => (
                    <React.Fragment key={lesson.id}>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center">
                        <button
                          onClick={() => handleBulkPresent(lesson.id)}
                          disabled={locked}
                          className="w-full text-[9px] font-medium px-0.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-400 transition-all flex items-center justify-center gap-0.5 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="text-[8px]">✔</span> Hamısı dərsdə
                        </button>
                      </th>
                      <th className="border-b border-r border-surface-dark/20 px-1 py-1 text-center">
                        <select
                          value={columnCategories[lesson.id] ?? 'ders'}
                          onChange={(e) => setColumnCategories((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                          disabled={locked}
                          className="w-[90px] text-center text-xs border border-surface-dark/20 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none bg-surface text-text-base/50 disabled:opacity-40"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </th>
                    </React.Fragment>
                  ))}
                  <th className="border-b border-r border-surface-dark/20" />
                  <th className="sticky right-0 z-20 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-1" />
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const catGrades = (cat: string): number[] =>
                    lessons
                      .filter(l => (columnCategories[l.id] ?? 'ders') === cat)
                      .map(l => getCell(student.id, l.id).grade)
                      .filter((g): g is number => g !== null)
                  const labG = catGrades('lab')
                  const modG = catGrades('modul')
                  const finG = catGrades('final')
                  const labAvg = labG.length > 0 ? labG.reduce((a, b) => a + b, 0) / labG.length : null
                  const modAvg = modG.length > 0 ? modG.reduce((a, b) => a + b, 0) / modG.length : null
                  const finalG = finG.length > 0 ? finG[finG.length - 1] : null
                  const avg = (labG.length > 0 || modG.length > 0 || finG.length > 0)
                    ? Math.round(((labAvg ?? 0) * 0.5 + (modAvg ?? 0) * 0.5) * 0.6 + (finalG ?? 0) * 0.4)
                    : null
                  const avgColor = avg === null
                    ? 'text-slate-300'
                    : avg >= 80 ? 'text-emerald-600 font-semibold'
                    : avg >= 60 ? 'text-amber-600 font-semibold'
                    : 'text-red-500 font-semibold'

                  return (
                    <tr key={student.id} className="hover:bg-surface-dark/30 transition-colors">
                      <td colSpan={2} className="sticky left-0 z-10 bg-white border-b border-r-2 border-surface-dark/20 min-w-[228px]">
                        <span className="inline-block w-[48px] text-center py-2 text-xs font-medium text-text-base/50 align-middle select-none">{index + 1}</span>
                        <span className="inline-block px-4 py-2 font-medium text-text-base align-middle whitespace-nowrap">{student.name} {student.surname}</span>
                      </td>
                      {visibleLessons.map((lesson) => {
                        const cell = getCell(student.id, lesson.id)
                        const colCategory = columnCategories[lesson.id] ?? 'ders'
                        const categoryAllowsGrade = colCategory !== 'ders'
                        return (
                          <React.Fragment key={lesson.id}>
                            <td className="border-b border-r border-surface-dark/20 px-2 py-1.5" style={{ minWidth: '150px' }}>
                              <AttendanceSegment
                                value={cell.attStatus}
                                onChange={(val) => setCell(student.id, lesson.id, {
                                  attStatus: val,
                                  minutesLate: val !== 'G' ? 0 : (cell.minutesLate ?? 0),
                                })}
                                minutesLate={cell.minutesLate ?? 0}
                                onMinutesChange={(mins) => setCell(student.id, lesson.id, { minutesLate: mins })}
                                disabled={locked}
                              />
                            </td>
                            <td className="border-b border-r border-surface-dark/20 px-1 py-1.5" style={{ minWidth: '90px' }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={cell.grade ?? ''}
                                onChange={(e) => {
                                  let val = e.target.value === '' ? null : Number(e.target.value)
                                  if (val !== null) {
                                    val = Math.min(100, Math.max(0, val))
                                  }
                                  setCell(student.id, lesson.id, { grade: val })
                                }}
                                onBlur={() => {
                                  if (cell.grade !== null) {
                                    const clamped = Math.min(100, Math.max(0, cell.grade))
                                    if (clamped !== cell.grade) {
                                      setCell(student.id, lesson.id, { grade: clamped })
                                    }
                                  }
                                }}
                                placeholder={categoryAllowsGrade ? 'Bal' : 'Dərs'}
                                disabled={locked || !categoryAllowsGrade}
                                autoComplete="off"
                                className={`w-[60px] mx-auto block text-center text-xs border border-surface-dark/20 rounded px-1 py-1 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none bg-surface ${(locked || !categoryAllowsGrade) ? 'opacity-40 cursor-not-allowed' : 'text-text-base'}`}
                              />
                            </td>
                          </React.Fragment>
                        )
                      })}
                      <td className="border-b border-r border-surface-dark/20" />
                      <td className={`sticky right-0 z-10 bg-slate-100 border-b border-l border-surface-dark/20 px-3 py-2 text-center font-semibold text-sm ${avgColor}`}>
                        {avg !== null ? `${avg}%` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 text-xs text-text-base/50 px-4 pb-4 pt-4 flex-wrap">
        <span className="font-medium">Status rəngləri:</span>
        <span className="flex items-center gap-1.5"><span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-green-600">İE</span> İştirak Edir</span>
        <span className="flex items-center gap-1.5"><span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-amber-500">G</span> Gecikib</span>
        <span className="flex items-center gap-1.5"><span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-blue-500">QÜ</span> Qaib (üzrlü)</span>
        <span className="flex items-center gap-1.5"><span className="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-bold text-white bg-red-500">Q</span> Qaib (üzrsüz)</span>
      </div>
    </div>
  )
}

function attStatusToJournalCode(status: string): string {
  switch (status) {
    case 'present': return 'I/E'
    case 'late': return 'G'
    case 'absent_excused': return 'QÜ'
    case 'absent_unexcused': return 'Q'
    default: return ''
  }
}

function journalCodeToAttStatus(code: string): string {
  switch (code) {
    case 'I/E': return 'present'
    case 'G': return 'late'
    case 'QÜ': return 'absent_excused'
    case 'Q': return 'absent_unexcused'
    default: return 'present'
  }
}
