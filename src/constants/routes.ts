export const ROUTES = {
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_GROUPS: '/teacher/groups',
  TEACHER_GROUP: (id: string) => `/teacher/groups/${id}`,
  TEACHER_LESSON_CREATE: '/teacher/lessons/create',
  TEACHER_ATTENDANCE: (id: string) => `/teacher/lessons/${id}/attendance`,
  TEACHER_GRADES: (id: string) => `/teacher/lessons/${id}/grades`,
  TEACHER_MATERIAL: '/teacher/materials/add',
  TEACHER_REPORTS: '/teacher/reports',
  TEACHER_PROFILE: '/teacher/profile',
} as const;
