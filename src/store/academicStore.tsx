import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AttendanceStatus, GradeCategory, JournalCell } from '../types'

export interface SharedStudent {
  studentId: string
  studentName: string
  studentSurname: string
  groupIds: string[]
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

export interface SharedMaterial {
  id: string
  lessonId: string
  teacherId: string
  teacherName: string
  title: string
  type: 'Fayl' | 'YouTube' | 'Google Drive' | 'Linklər'
  uploadDate: string
  url: string
  filePath?: string
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
  { studentId: 's1', studentName: 'Əli',    studentSurname: 'Məmmədov', groupIds: ['1', '2'] },
  { studentId: 's2', studentName: 'Sona',   studentSurname: 'Quliyeva', groupIds: ['1'] },
  { studentId: 's3', studentName: 'Orxan',  studentSurname: 'Rəsulov',  groupIds: ['1'] },
  { studentId: 's4', studentName: 'Vüsal',  studentSurname: 'Qəfarov',  groupIds: ['1'] },
  { studentId: 's5', studentName: 'Leyla',  studentSurname: 'Əliyeva',  groupIds: ['1'] },
  { studentId: 's6', studentName: 'Murad',  studentSurname: 'Həsənov',  groupIds: ['1'] },
  { studentId: 's7', studentName: 'Nigar',  studentSurname: 'Babayeva', groupIds: ['2'] },
  { studentId: 's8', studentName: 'Rauf',   studentSurname: 'İsmayılov', groupIds: ['2'] },
  { studentId: 's9', studentName: 'Könül',  studentSurname: 'Nəsirov',  groupIds: ['3'] },
  { studentId: 's10',studentName: 'Tural',  studentSurname: 'Qədirov',  groupIds: ['3'] },
]

export const SHARED_MATERIALS: SharedMaterial[] = [
  { id:'m1', lessonId:'l1', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'Dərs 01 - Giriş Konspekti', type:'Fayl',
    uploadDate:'01.06.2026', url:'#', filePath:'#' },
  { id:'m2', lessonId:'l2', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'Dəyişənlər - Videodərs', type:'YouTube',
    uploadDate:'03.06.2026', url:'https://youtube.com' },
  { id:'m3', lessonId:'l3', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'Massivlər Sənədi', type:'Google Drive',
    uploadDate:'06.06.2026', url:'https://drive.google.com' },
  { id:'m4', lessonId:'l4', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'Funksiyalar - Faydalı Keçidlər', type:'Linklər',
    uploadDate:'08.06.2026', url:'https://python.org' },
  { id:'m5', lessonId:'l5', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'Döngülər Konspekti', type:'Fayl',
    uploadDate:'10.06.2026', url:'#', filePath:'#' },
  { id:'m6', lessonId:'l6', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'HTML Əsasları - Slaydlar', type:'Fayl',
    uploadDate:'02.06.2026', url:'#', filePath:'#' },
  { id:'m7', lessonId:'l7', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'CSS Flex - Praktiki Tapşırıq', type:'Google Drive',
    uploadDate:'05.06.2026', url:'https://drive.google.com' },
  { id:'m8', lessonId:'l9', teacherId:'t1', teacherName:'Əli Həsənov',
    title:'JS-B1 Dərs Materialları', type:'YouTube',
    uploadDate:'04.06.2026', url:'https://youtube.com' },
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
  const students = SHARED_STUDENTS.filter((s) => s.groupIds.includes(groupId))
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

// ── Student selectors ──────────────────────────────────────────────

export function getStudentAttendance(
  state: AcademicState, studentId: string, groupId?: string,
) {
  const student = SHARED_STUDENTS.find((s) => s.studentId === studentId)
  if (!student) return []
  const allGroupIds = groupId ? [groupId] : student.groupIds
  const lessonIds = new Set(
    SHARED_LESSONS.filter((l) => allGroupIds.includes(l.groupId)).map((l) => l.id),
  )
  return state.attendance
    .filter((a) => a.studentId === studentId && lessonIds.has(a.lessonId))
    .map((a) => {
      const lesson = SHARED_LESSONS.find((l) => l.id === a.lessonId)
      const group = SHARED_GROUPS.find((g) => g.id === lesson?.groupId)
      return {
        ...a,
        lessonDate: lesson?.date ?? '—',
        lessonTopic: lesson?.topic ?? '—',
        groupName: group?.name ?? '—',
      }
    })
}

export function getStudentGrades(
  state: AcademicState, studentId: string, groupId?: string,
) {
  const student = SHARED_STUDENTS.find((s) => s.studentId === studentId)
  if (!student) return []
  const allGroupIds = groupId ? [groupId] : student.groupIds
  const lessonIds = new Set(
    SHARED_LESSONS.filter((l) => allGroupIds.includes(l.groupId)).map((l) => l.id),
  )
  return state.grades
    .filter((g) => g.studentId === studentId && lessonIds.has(g.lessonId))
    .map((g) => {
      const lesson = SHARED_LESSONS.find((l) => l.id === g.lessonId)
      const group = SHARED_GROUPS.find((gr) => gr.id === lesson?.groupId)
      return {
        ...g,
        lessonDate: lesson?.date ?? '—',
        lessonTopic: lesson?.topic ?? '—',
        groupName: group?.name ?? '—',
      }
    })
}

export function getStudentDashboardStats(state: AcademicState, studentId: string) {
  const student = SHARED_STUDENTS.find((s) => s.studentId === studentId)
  if (!student) {
    return { groupCount: 0, totalLessons: 0, attendancePct: 0, avgGrade: 0 }
  }
  const groups = SHARED_GROUPS.filter((g) => student.groupIds.includes(g.id))
  const lessonIds = new Set(
    SHARED_LESSONS.filter((l) => student.groupIds.includes(l.groupId)).map((l) => l.id),
  )
  const att = state.attendance.filter((a) => a.studentId === studentId && lessonIds.has(a.lessonId))
  const gr = state.grades
    .filter((g) => g.studentId === studentId && lessonIds.has(g.lessonId) && g.score !== null)
    .map((g) => g.score as number)
  const attPct = att.length
    ? Math.round(att.filter((a) => a.status === 'present' || a.status === 'late').length / att.length * 100)
    : 0
  const avgGrade = gr.length
    ? Math.round(gr.reduce((a, b) => a + b, 0) / gr.length)
    : 0
  return {
    groupCount:   groups.length,
    totalLessons: lessonIds.size,
    attendancePct: attPct,
    avgGrade,
  }
}

export function getStudentMaterials(studentId: string) {
  const student = SHARED_STUDENTS.find((s) => s.studentId === studentId)
  if (!student) return []
  const allGroupIds = student.groupIds
  const groupLessonIds = new Set(
    SHARED_LESSONS
      .filter((l) => allGroupIds.includes(l.groupId))
      .map((l) => l.id),
  )
  return SHARED_MATERIALS
    .filter((m) => groupLessonIds.has(m.lessonId))
    .map((m) => {
      const lesson = SHARED_LESSONS.find((l) => l.id === m.lessonId)
      const group = SHARED_GROUPS.find((g) => g.id === lesson?.groupId)
      return {
        ...m,
        lessonTopic: lesson?.topic ?? '—',
        groupName:   group?.name  ?? '—',
      }
    })
}
