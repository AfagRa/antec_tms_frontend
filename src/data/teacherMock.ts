import type {
  AttendanceRecord,
  AttendanceStatus,
  DashboardStats,
  Group,
  Lesson,
  Material,
  Notification,
  Student,
} from '../types';

export const DEFAULT_GROUP_ID = '1';
export const DEFAULT_LESSON_ID = '1';

export const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Python-A1',
    courseName: 'Tədris Kurs',
    teacherName: 'Admin',
    studentCount: 35,
    startDate: '07.05.2023',
    endDate: '02.08.2023',
    status: 'Aktiv',
    lastLessonDate: '07.05.2023',
  },
  {
    id: '2',
    name: 'Qrup adı 2',
    courseName: 'Tədris Kurs',
    teacherName: 'Admin',
    studentCount: 18,
    startDate: '15.02.2023',
    endDate: '15.07.2023',
    status: 'Aktiv',
    lastLessonDate: '05.05.2023',
  },
  {
    id: '3',
    name: 'Qrup adı 3',
    courseName: 'Tədris Kurs',
    teacherName: 'Admin',
    studentCount: 12,
    startDate: '01.03.2022',
    endDate: '01.09.2022',
    status: 'Tamamlanmış',
    lastLessonDate: '28.08.2022',
  },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Əli',
    surname: 'Məmmədov',
    email: 'eli.mammadov@example.com',
    phone: '+994 50 000 00 01',
    joinedAt: '01.02.2023',
    status: 'Aktiv',
  },
  {
    id: '2',
    name: 'Sona',
    surname: 'Quliyeva',
    email: 'sona.quliyeva@example.com',
    phone: '+994 50 000 00 02',
    joinedAt: '01.02.2023',
    status: 'Aktiv',
  },
  {
    id: '3',
    name: 'Orxan',
    surname: 'Rəsulov',
    email: 'orxan.rasulov@example.com',
    phone: '+994 50 000 00 03',
    joinedAt: '05.02.2023',
    status: 'Passiv' as const,
  },
  {
    id: '4',
    name: 'Leyla',
    surname: 'Hüseynova',
    email: 'leyla.huseynova@example.com',
    phone: '+994 50 000 00 04',
    joinedAt: '10.02.2023',
    status: 'Çıxıb' as const,
  },
  {
    id: '5',
    name: 'Rəşad',
    surname: 'Əliyev',
    email: 'rashad.aliyev@example.com',
    phone: '+994 50 000 00 05',
    joinedAt: '12.02.2023',
    status: 'Məzun' as const,
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: DEFAULT_LESSON_ID,
    groupId: DEFAULT_GROUP_ID,
    groupName: 'Python-A1',
    teacherName: 'Admin',
    lessonDate: '07.05.2023',
    topic: 'Python-A1',
    status: 'draft',
  },
  {
    id: '2',
    groupId: DEFAULT_GROUP_ID,
    groupName: 'Python-A1',
    teacherName: 'Admin',
    lessonDate: '08.05.2023',
    topic: 'Dərs mövzusu',
    status: 'draft',
  },
  {
    id: '3',
    groupId: DEFAULT_GROUP_ID,
    groupName: 'Python-A1',
    teacherName: 'Admin',
    lessonDate: '09.05.2023',
    topic: 'Dərs mövzusu',
    status: 'completed',
  },
  {
    id: 'lesson-5',
    groupId: DEFAULT_GROUP_ID,
    groupName: 'Python-A1',
    teacherName: 'Admin',
    lessonDate: '12.05.2023',
    topic: 'Dərs 05 - Massivlənriər və Obyektlər',
    status: 'completed',
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  activeGroupCount: 19,
  weeklyLessonCount: 33,
  draftJournalCount: 1,
  totalStudentCount: 384,
};

export const MOCK_TODAY_LESSONS: Lesson[] = MOCK_LESSONS.slice(0, 3);

export const MOCK_MATERIALS: Material[] = [
  {
    id: 'm1',
    lessonId: 'lesson-5',
    groupId: DEFAULT_GROUP_ID,
    title: 'Dərs 05 - Massivlər və Obyektlər',
    type: 'file',
    filePath: '/materials/lesson-05.pdf',
    createdAt: '12.05.2023',
  },
  {
    id: 'm2',
    lessonId: DEFAULT_LESSON_ID,
    groupId: DEFAULT_GROUP_ID,
    title: 'Python giriş video',
    type: 'youtube',
    url: 'https://youtube.com/watch?v=example',
    createdAt: '07.05.2023',
  },
  {
    id: 'm3',
    lessonId: '2',
    groupId: DEFAULT_GROUP_ID,
    title: 'Əlavə oxu materialı',
    type: 'link',
    url: 'https://example.com/docs',
    createdAt: '08.05.2023',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', text: 'Son Bildirişlər və Elanlar', time: '10:47 AM' },
  { id: '2', text: 'Son Həftə Keçirilmiş Dərslər', time: '12:33 AM' },
  { id: '3', text: 'Son Bildirişlər və Elanlar', time: '07:06 AM' },
  { id: '4', text: 'Son Bildirişlər və Elanlar', time: '08:37 AM' },
];

export function getGroupById(id: string): Group | undefined {
  return MOCK_GROUPS.find((group) => group.id === id);
}

export function getLessonById(id: string): Lesson | undefined {
  return MOCK_LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonsByGroupId(groupId: string): Lesson[] {
  return MOCK_LESSONS.filter((lesson) => lesson.groupId === groupId);
}

export function getMaterialsByGroupId(groupId: string): Material[] {
  return MOCK_MATERIALS.filter((material) => material.groupId === groupId);
}

export function formatLessonDateTime(lesson: Lesson): string {
  return `${lesson.lessonDate} / 10:00`;
}

export function createAttendanceRecords(
  lessonId: string,
  initialStatus: AttendanceStatus = 'present',
): AttendanceRecord[] {
  return MOCK_STUDENTS.map((student) => ({
    id: `${lessonId}-${student.id}`,
    lessonId,
    studentId: student.id,
    studentName: student.name,
    studentSurname: student.surname,
    status: initialStatus,
    minutesLate: 0,
    reason: '',
    teacherNote: '',
  }));
}
