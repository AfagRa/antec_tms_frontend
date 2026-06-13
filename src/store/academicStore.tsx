import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AttendanceStatus, GradeCategory, JournalCell } from '../types'

export interface SharedStudent {
  studentId: string
  studentName: string
  studentSurname: string
  groupId: string
}

export interface SharedLesson {
  id: string
  groupId: string
  date: string
  topic: string
}

export interface AttendanceEntry {
  lessonId: string
  studentId: string
  status: AttendanceStatus
  minutesLate: number
  reason: string
  teacherNote: string
}

export interface GradeEntry {
  lessonId: string
  studentId: string
  score: number | null
  maxScore: number
  teacherNote: string
  category: GradeCategory
}

export interface AcademicState {
  attendance: AttendanceEntry[]
  grades: GradeEntry[]
}

export const SHARED_GROUPS = [
  { id: '1', name: 'Python-A1' },
  { id: '2', name: 'Code-A2' },
  { id: '3', name: 'JS-B1' },
]

export const SHARED_LESSONS: SharedLesson[] = [
  { id: 'l1', groupId: '1', date: '01.06.2026', topic: 'Giriş' },
  { id: 'l2', groupId: '1', date: '03.06.2026', topic: 'Dəyişənlər' },
  { id: 'l3', groupId: '1', date: '06.06.2026', topic: 'Massivlər' },
  { id: 'l4', groupId: '1', date: '08.06.2026', topic: 'Funksiyalar' },
  { id: 'l5', groupId: '1', date: '10.06.2026', topic: 'Döngülər' },
  { id: 'l6', groupId: '2', date: '02.06.2026', topic: 'HTML Əsasları' },
  { id: 'l7', groupId: '2', date: '05.06.2026', topic: 'CSS Flex' },
  { id: 'l8', groupId: '2', date: '09.06.2026', topic: 'JS Giriş' },
  { id: 'l9', groupId: '3', date: '04.06.2026', topic: 'Dəyişənlər' },
  { id: 'l10',groupId: '3', date: '07.06.2026', topic: 'Funksiyalar' },
]

export const SHARED_STUDENTS: SharedStudent[] = [
  { studentId: 's1', studentName: 'Əli',    studentSurname: 'Məmmədov', groupId: '1' },
  { studentId: 's2', studentName: 'Sona',   studentSurname: 'Quliyeva', groupId: '1' },
  { studentId: 's3', studentName: 'Orxan',  studentSurname: 'Rəsulov',  groupId: '1' },
  { studentId: 's4', studentName: 'Vüsal',  studentSurname: 'Qəfarov',  groupId: '1' },
  { studentId: 's5', studentName: 'Leyla',  studentSurname: 'Əliyeva',  groupId: '1' },
  { studentId: 's6', studentName: 'Murad',  studentSurname: 'Həsənov',  groupId: '1' },
  { studentId: 's7', studentName: 'Nigar',  studentSurname: 'Babayeva', groupId: '2' },
  { studentId: 's8', studentName: 'Rauf',   studentSurname: 'İsmayılov',groupId: '2' },
  { studentId: 's9', studentName: 'Könül',  studentSurname: 'Nəsirov',  groupId: '3' },
  { studentId: 's10',studentName: 'Tural',  studentSurname: 'Qədirov',  groupId: '3' },
]

const initialState: AcademicState = { attendance: [], grades: [] }

type Action =
  | { type: 'SET_ATTENDANCE'; payload: AttendanceEntry[] }
  | { type: 'UPSERT_ATTENDANCE'; payload: AttendanceEntry }
  | { type: 'BULK_ATTENDANCE'; lessonId: string; entries: AttendanceEntry[] }
  | { type: 'SET_GRADES'; payload: GradeEntry[] }
  | { type: 'UPSERT_GRADE'; payload: GradeEntry }
  | { type: 'BULK_GRADES'; lessonId: string; entries: GradeEntry[] }

function upsert<T extends { lessonId: string; studentId: string }>(
  arr: T[], item: T,
): T[] {
  const idx = arr.findIndex(
    (x) => x.lessonId === item.lessonId && x.studentId === item.studentId,
  )
  if (idx === -1) return [...arr, item]
  return arr.map((x, i) => (i === idx ? item : x))
}

function academicReducer(state: AcademicState, action: Action): AcademicState {
  switch (action.type) {
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload }
    case 'UPSERT_ATTENDANCE':
      return { ...state, attendance: upsert(state.attendance, action.payload) }
    case 'BULK_ATTENDANCE':
      return {
        ...state,
        attendance: [
          ...state.attendance.filter((a) => a.lessonId !== action.lessonId),
          ...action.entries,
        ],
      }
    case 'SET_GRADES':
      return { ...state, grades: action.payload }
    case 'UPSERT_GRADE':
      return { ...state, grades: upsert(state.grades, action.payload) }
    case 'BULK_GRADES':
      return {
        ...state,
        grades: [
          ...state.grades.filter((g) => g.lessonId !== action.lessonId),
          ...action.entries,
        ],
      }
    default:
      return state
  }
}

const AcademicContext = createContext<{
  state: AcademicState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(academicReducer, initialState)
  return (
    <AcademicContext.Provider value={{ state, dispatch }}>
      {children}
    </AcademicContext.Provider>
  )
}

export function useAcademic() {
  const ctx = useContext(AcademicContext)
  if (!ctx) throw new Error('useAcademic must be inside AcademicProvider')
  return ctx
}

export function getAttendanceForLesson(
  state: AcademicState, lessonId: string,
): AttendanceEntry[] {
  return state.attendance.filter((a) => a.lessonId === lessonId)
}

export function getGradesForLesson(
  state: AcademicState, lessonId: string,
): GradeEntry[] {
  return state.grades.filter((g) => g.lessonId === lessonId)
}

export function getAttendanceStats(state: AcademicState, groupId?: string) {
  const lessons = groupId
    ? SHARED_LESSONS.filter((l) => l.groupId === groupId)
    : SHARED_LESSONS
  const lessonIds = new Set(lessons.map((l) => l.id))
  const relevant = state.attendance.filter((a) => lessonIds.has(a.lessonId))
  return {
    present:   relevant.filter((a) => a.status === 'present').length,
    late:      relevant.filter((a) => a.status === 'late').length,
    excused:   relevant.filter((a) => a.status === 'absent_excused').length,
    unexcused: relevant.filter((a) => a.status === 'absent_unexcused').length,
    total:     relevant.length,
  }
}

export function getGradeStats(state: AcademicState, groupId?: string) {
  const lessons = groupId
    ? SHARED_LESSONS.filter((l) => l.groupId === groupId)
    : SHARED_LESSONS
  const lessonIds = new Set(lessons.map((l) => l.id))
  const relevant = state.grades
    .filter((g) => lessonIds.has(g.lessonId) && g.score !== null)
    .map((g) => g.score as number)
  if (relevant.length === 0) return { avg: 0, highest: 0, lowest: 0, count: 0 }
  return {
    avg:     Math.round(relevant.reduce((a, b) => a + b, 0) / relevant.length),
    highest: Math.max(...relevant),
    lowest:  Math.min(...relevant),
    count:   relevant.length,
  }
}

export function getGroupStats(state: AcademicState, groupId: string) {
  const students = SHARED_STUDENTS.filter((s) => s.groupId === groupId)
  const lessons = SHARED_LESSONS.filter((l) => l.groupId === groupId)
  const att = getAttendanceStats(state, groupId)
  const gr = getGradeStats(state, groupId)
  const attPct = att.total > 0
    ? Math.round(((att.present + att.late) / att.total) * 100)
    : 0
  return {
    studentCount:     students.length,
    lessonCount:      lessons.length,
    avgAttendance:    attPct,
    avgGrade:         gr.avg,
    completedLessons: lessons.length,
  }
}

export function attStatusToCode(s: AttendanceStatus): JournalCell['attendance'] {
  if (s === 'present')          return 'I/E'
  if (s === 'late')             return 'G'
  if (s === 'absent_excused')   return 'QÜ'
  if (s === 'absent_unexcused') return 'Q'
  return null
}

export function codeToAttStatus(c: JournalCell['attendance']): AttendanceStatus {
  if (c === 'I/E') return 'present'
  if (c === 'G')   return 'late'
  if (c === 'QÜ')  return 'absent_excused'
  if (c === 'Q')   return 'absent_unexcused'
  return 'present'
}
