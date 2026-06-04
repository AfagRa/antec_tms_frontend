export type Role = 'admin' | 'teacher' | 'student';
export type GroupStatus = 'Aktiv' | 'Tamamlanmış' | 'Passiv';
export type LessonStatus = 'draft' | 'completed';
export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late';
export type MaterialType = 'file' | 'link' | 'video_link' | 'google_drive' | 'youtube';

export interface Group {
  id: string;
  name: string;
  courseName: string;
  teacherName: string;
  studentCount: number;
  startDate: string;
  endDate: string;
  status: GroupStatus;
  lastLessonDate?: string;
}

export interface Student {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  joinedAt: string;
  status: 'Aktiv' | 'Passiv';
}

export interface Lesson {
  id: string;
  groupId: string;
  groupName: string;
  teacherName: string;
  lessonDate: string;
  topic: string;
  note?: string;
  status: LessonStatus;
}

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  studentSurname: string;
  status: AttendanceStatus;
  minutesLate?: number;
  reason?: string;
  teacherNote?: string;
}

export interface GradeRecord {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  studentSurname: string;
  attendanceStatus?: AttendanceStatus;
  score?: number;
  maxScore: number;
  teacherNote?: string;
}

export interface Material {
  id: string;
  lessonId: string;
  groupId: string;
  title: string;
  type: MaterialType;
  url?: string;
  filePath?: string;
  description?: string;
  createdAt: string;
}

export interface DashboardStats {
  activeGroupCount: number;
  weeklyLessonCount: number;
  draftJournalCount: number;
  totalStudentCount: number;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
}
