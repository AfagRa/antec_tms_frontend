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
  id: number
  student: { id: number; full_name: string }
  lesson: { id: number; date: string; topic: string }
  present: boolean
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
