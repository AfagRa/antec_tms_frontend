export type UserRole = 'admin' | 'teacher' | 'student'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: number
  name: string
  surname: string
  email: string
  role: UserRole
  phone?: string
  status: UserStatus
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Paginated<T> {
  data: T[]
  total: number
  page?: number
  per_page?: number
}

export interface Course {
  id: number
  name: string
  description?: string
  status: UserStatus
  groups_count?: number
  created_at: string
}

export interface CoursePayload {
  name: string
  description?: string
  status: UserStatus
}

export interface GroupCourse {
  id: number
  name: string
}

export interface GroupTeacher {
  id: number
  name: string
  surname: string
  full_name?: string
}

export interface GroupStudent {
  id: number
  name: string
  surname: string
  email?: string
  status: UserStatus
  full_name?: string
}

export interface Group {
  id: number
  name: string
  course: GroupCourse
  teacher: GroupTeacher
  students_count: number
  start_date: string
  end_date?: string
  status: UserStatus
  students?: GroupStudent[]
}

export interface GroupPayload {
  name: string
  course_id: number
  teacher_id: number
  start_date: string
  end_date?: string
  status: UserStatus
}

export interface Teacher {
  id: number
  user_id?: number
  name: string
  surname: string
  full_name?: string
  email: string
  phone?: string
  specialization?: string
  bio?: string
  status: UserStatus
  groups?: { id: number; name: string }[]
}

export interface TeacherPayload {
  name: string
  surname: string
  email: string
  password?: string
  phone?: string
  specialization?: string
  bio?: string
  status: UserStatus
}

export interface Student {
  id: number
  user_id?: number
  name: string
  surname: string
  full_name?: string
  email: string
  phone?: string
  birth_date?: string
  note?: string
  status: UserStatus
  groups?: { id: number; name: string }[]
  group?: { id: number; name: string }
}

export interface StudentPayload {
  name: string
  surname: string
  email: string
  password?: string
  phone?: string
  birth_date?: string
  note?: string
  status: UserStatus
}

export interface Lesson {
  id: number
  date: string
  group: { id: number; name: string }
  topic: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface AttendanceRecord {
  id: string
  lessonId: string
  studentId: string
  studentName: string
  studentSurname: string
  status: AttendanceStatus
  minutesLate: number
  reason: string
  teacherNote: string
}

export interface Grade {
  id: number
  student: { id: number; full_name: string }
  lesson: { id: number; topic: string }
  score: number
  max_score: number
}

export interface Material {
  id: number
  title: string
  url: string
  type: 'pdf' | 'video' | 'link'
  created_at: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface DashboardStats {
  courses: number
  groups: number
  teachers: number
  students: number
}

export type GradeCategory =
  | 'daily'
  | 'module'
  | 'final'
  | 'project'
  | 'homework'

export const GRADE_CATEGORY_LABELS: Record<GradeCategory, string> = {
  daily:    'Günlük',
  module:   'Modul',
  final:    'Final',
  project:  'Layihə',
  homework: 'Ev Tapşırığı',
}

export const GRADE_CATEGORY_STYLES: Record<GradeCategory, string> = {
  daily:    'bg-blue-100 text-blue-700',
  module:   'bg-purple-100 text-purple-700',
  final:    'bg-red-100 text-red-700',
  project:  'bg-amber-100 text-amber-700',
  homework: 'bg-green-100 text-green-700',
}

export type StudentGroupStatus = 'Aktiv' | 'Passiv' | 'Çıxıb' | 'Məzun'

export const STUDENT_STATUS_CONFIG: Record<StudentGroupStatus, {
  label: string; bg: string; text: string
}> = {
  Aktiv:  { label: 'Aktiv',  bg: 'bg-green-100',  text: 'text-green-700'  },
  Passiv: { label: 'Passiv', bg: 'bg-gray-100',   text: 'text-gray-600'   },
  Çıxıb:  { label: 'Çıxıb',  bg: 'bg-red-100',    text: 'text-red-600'    },
  Məzun:  { label: 'Məzun',  bg: 'bg-purple-100', text: 'text-purple-700' },
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late'

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present:          'Dərsdə',
  absent_excused:   'Qayıb (üzrlü)',
  absent_unexcused: 'Qayıb (üzrsüz)',
  late:             'Gecikdi',
}

export const ATTENDANCE_STATUS_SHORT: Record<AttendanceStatus, string> = {
  present:          'Dərsdə',
  absent_excused:   'Q/Üzrlü',
  absent_unexcused: 'Q/Üzrsüz',
  late:             'Gecikdi',
}

export interface JournalLesson {
  id: string
  date: string
  topic: string
}

export interface JournalCell {
  attendance: 'I/E' | 'Q' | 'QÜ' | 'G' | null
  grade?: number | null
  minutesLate?: number
  maxGrade?: number
  category?: GradeCategory
}

export interface GradeRecord {
  id: string
  lessonId: string
  studentId: string
  studentName: string
  studentSurname: string
  attendanceStatus: AttendanceStatus
  score: number | undefined
  maxScore: number
  teacherNote: string
  category?: GradeCategory
}
