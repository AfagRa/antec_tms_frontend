export type UserRole = 'admin' | 'teacher' | 'student'
export type UserStatus = 'active' | 'inactive'

export const STATUS_LABELS: Record<string, string> = {
  active:   'Aktiv',
  inactive: 'Passiv',
}

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
  lesson_id: number
  group_id: number
  teacher_id: number
  title: string
  type: string
  url?: string
  file_path?: string
  description?: string
  created_at: string
}

export interface CreateMaterialPayload {
  lesson_id: number
  group_id: number
  teacher_id: number
  title: string
  type: string
  url?: string
  file_path?: string
  description?: string
}

export interface TeacherDashboardResponse {
  total_groups: number
  total_students: number
  upcoming_lessons: number
  recent_materials: number
  pending_grades: number
  weekly_lessons_completed: number
  weekly_lessons_total: number
  recent_groups: TeacherGroupItem[]
  recent_lessons: TeacherLessonItem[]
}

export interface WeeklyScheduleItem {
  lesson_id: number
  group_id: number
  group_name: string
  topic: string
  lesson_date: string
  day_of_week_index: number
  hour: number
}

export interface TeacherGroupItem {
  id: number
  name: string | null
  student_count: number
}

export interface TeacherLessonItem {
  id: number
  group_name: string | null
  lesson_date: string
  topic: string
  status: string
}

export interface MyDashboardResponse {
  group: MyGroupInfo | null
  recentLessons: MyRecentLesson[]
  recentGrades: MyRecentGrade[]
  attendanceSummary: MyAttendanceSummary
  finalGrade: number
  isEligibleForFinal: boolean
}

export interface MyGroupInfo {
  id: number
  name: string
  status: string
}

export interface MyRecentLesson {
  id: number
  topic: string
  lesson_date: string
  material_count: number
}

export interface MyRecentGrade {
  id: number
  lessonTopic: string
  score: number
  maxScore: number
}

export interface MyAttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
}

export interface MyLessonItem {
  id: number
  topic: string
  note: string | null
  lesson_date: string
  group_name: string
  materials: MyMaterialRef[]
}

export interface MyMaterialRef {
  id: number
  title: string
  description: string | null
  type: string
  file_path: string | null
}

export interface MyAttendanceItem {
  id: number
  lesson_date: string
  lesson_topic: string
  group_name?: string
  status: string
  minutes_late: number | null
  reason: string | null
}

export interface AttendanceJournalResponse {
  items: MyAttendanceItem[]
  presentCount: number
  excusedCount: number
  absentCount: number
  lateCount: number
  percentage: number
}

export interface MyGradeItem {
  id: number
  lesson_topic: string
  lesson_date: string
  group_name?: string
  category?: GradeCategory
  score: number
  max_score: number
  teacher_note: string | null
}

export interface MyMaterialDetail {
  id: number
  title: string
  description: string | null
  type: string
  file_path: string | null
  lesson_topic: string
  lesson_date: string
}

export interface MyProfileResponse {
  id: number
  name: string
  surname: string
  email: string
  phone: string | null
  birth_date: string | null
  note: string | null
  status: string
}

export interface TeacherDetailResponse {
  id: number
  user_id: number
  name: string
  surname: string
  email: string
  phone: string | null
  specialization: string | null
  bio: string | null
  status: string
  groups: { id: number; name: string }[]
}

export interface CreateLessonPayload {
  group_id: number
  teacher_id: number
  lesson_date: string
  topic: string
  note?: string
  status: string
}

export interface GroupLessonItem {
  id: number
  lesson_date: string
  topic: string
  status: string
  attendance_count: number
  grade_count: number
  category?: string
}

export interface LessonAttendanceItem {
  id: number
  student_id: number
  student_name: string | null
  status: string
  minutes_late: number | null
  reason: string | null
}

export interface LessonGradeItem {
  id: number
  student_id: number
  student_name: string | null
  score: number
  max_score: number
}

export interface CreateAttendancePayload {
  student_id: number
  status: string
  minutes_late?: number | null
  reason?: string | null
  teacher_note?: string | null
}

export interface CreateGradePayload {
  student_id: number
  score: number
  max_score: number
  teacher_note?: string | null
}

export interface AttendanceReportResult {
  total_lessons: number
  total_records: number
  present: number
  absent: number
  late: number
  excused: number
  attendance_percentage: number
  details: AttendanceReportDetail[]
}

export interface AttendanceReportDetail {
  student_id: number
  student_name: string | null
  present: number
  absent: number
  late: number
  excused: number
  attendance_percentage: number
}

export interface GradesReportResult {
  total_records: number
  average_score: number
  average_max_score: number
  overall_percentage: number
  details: GradesReportDetail[]
}

export interface GradesReportDetail {
  student_id: number
  student_name: string | null
  total_score: number
  total_max_score: number
  percentage: number
  grade_count: number
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
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
  | 'ders'
  | 'lab'
  | 'modul'
  | 'final'

export const GRADE_CATEGORY_LABELS: Record<GradeCategory, string> = {
  ders:  'Dərs',
  lab:   'Lab',
  modul: 'Modul',
  final: 'Final',
}

export const GRADE_CATEGORY_STYLES: Record<GradeCategory, string> = {
  ders:  'bg-blue-100 text-blue-700',
  lab:   'bg-green-100 text-green-700',
  modul: 'bg-purple-100 text-purple-700',
  final: 'bg-red-100 text-red-700',
}

export type StudentGroupStatus = 'Aktiv' | 'Passiv' | 'Çıxıb' | 'Məzun'

export const STUDENT_STATUS_CONFIG: Record<StudentGroupStatus, {
  label: string; bg: string; text: string
}> = {
  Aktiv:  { label: 'Aktiv',  bg: 'bg-green-100',  text: 'text-green-700'  },
  Passiv: { label: 'Qeyri-aktiv', bg: 'bg-gray-100',   text: 'text-gray-600'   },
  Çıxıb:  { label: 'Çıxıb',  bg: 'bg-red-100',    text: 'text-red-600'    },
  Məzun:  { label: 'Məzun',  bg: 'bg-purple-100', text: 'text-purple-700' },
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late'

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present:          'İştirak edib',
  absent_excused:   'Qaib (üzrlü)',
  absent_unexcused: 'Qaib (üzrsüz)',
  late:             'Gecikdi',
}

export const ATTENDANCE_STATUS_SHORT: Record<AttendanceStatus, string> = {
  present:          'İ/E',
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

export type MaterialType = 'file' | 'link' | 'youtube' | 'google_drive'

export const MATERIAL_TYPE_CONFIG = {
  'Fayl': {
    bg:       'bg-blue-100',
    text:     'text-blue-700',
    border:   'border-blue-200',
    icon:     'File',
    iconColor:'text-blue-500',
  },
  'YouTube': {
    bg:       'bg-red-100',
    text:     'text-red-700',
    border:   'border-red-200',
    icon:     'Youtube',
    iconColor:'text-red-500',
  },
  'Google Drive': {
    bg:       'bg-green-100',
    text:     'text-green-700',
    border:   'border-green-200',
    icon:     'HardDrive',
    iconColor:'text-green-500',
  },
  'Linklər': {
    bg:       'bg-purple-100',
    text:     'text-purple-700',
    border:   'border-purple-200',
    icon:     'Link2',
    iconColor:'text-purple-500',
  },
} as const

export type MaterialTypeName = keyof typeof MATERIAL_TYPE_CONFIG

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
