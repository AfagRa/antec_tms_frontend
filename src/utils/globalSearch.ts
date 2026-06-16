import {
  SHARED_GROUPS, SHARED_STUDENTS, SHARED_LESSONS, SHARED_MATERIALS,
} from '../store/academicStore'
import { ROUTES } from '../constants/routes'

export type SearchResultType = 'group' | 'student' | 'lesson' | 'material'

export interface GlobalSearchResult {
  id: string
  type: SearchResultType
  label: string
  category: string
  to: string
}

export function searchGlobal(query: string): GlobalSearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1) return []

  const results: GlobalSearchResult[] = []

  SHARED_GROUPS.forEach((g) => {
    if (g.name.toLowerCase().includes(q)) {
      results.push({
        id: `group-${g.id}`,
        type: 'group',
        label: g.name,
        category: 'Qrup',
        to: ROUTES.TEACHER_GROUP(g.id),
      })
    }
  })

  SHARED_STUDENTS.forEach((s) => {
    const full = `${s.studentName} ${s.studentSurname}`.toLowerCase()
    if (full.includes(q)) {
      results.push({
        id: `student-${s.studentId}`,
        type: 'student',
        label: `${s.studentName} ${s.studentSurname}`,
        category: 'Tələbə',
        to: ROUTES.TEACHER_GROUPS,
      })
    }
  })

  SHARED_LESSONS.forEach((l) => {
    if (l.topic.toLowerCase().includes(q) || l.date.includes(q)) {
      const group = SHARED_GROUPS.find((g) => g.id === l.groupId)
      results.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        label: `${l.topic} — ${l.date}`,
        category: group?.name ?? 'Dərs',
        to: ROUTES.TEACHER_JOURNAL,
      })
    }
  })

  SHARED_MATERIALS.forEach((m) => {
    if (m.title.toLowerCase().includes(q)) {
      results.push({
        id: `material-${m.id}`,
        type: 'material',
        label: m.title,
        category: m.type,
        to: ROUTES.TEACHER_MATERIAL,
      })
    }
  })

  return results.slice(0, 8)
}

export function searchGlobalStudent(query: string, studentId: string): GlobalSearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1) return []

  const student = SHARED_STUDENTS.find((s) => s.studentId === studentId)
  const myGroupIds = new Set(student?.groupIds ?? [])

  const results: GlobalSearchResult[] = []

  SHARED_GROUPS
    .filter((g) => myGroupIds.has(g.id))
    .forEach((g) => {
      if (g.name.toLowerCase().includes(q)) {
        results.push({
          id: `group-${g.id}`,
          type: 'group',
          label: g.name,
          category: 'Qrup',
          to: ROUTES.STUDENT_GROUPS,
        })
      }
    })

  SHARED_LESSONS
    .filter((l) => myGroupIds.has(l.groupId))
    .forEach((l) => {
      if (l.topic.toLowerCase().includes(q) || l.date.includes(q)) {
        const group = SHARED_GROUPS.find((g) => g.id === l.groupId)
        results.push({
          id: `lesson-${l.id}`,
          type: 'lesson',
          label: `${l.topic} — ${l.date}`,
          category: group?.name ?? 'Dərs',
          to: ROUTES.STUDENT_GROUPS,
        })
      }
    })

  SHARED_MATERIALS
    .filter((m) => myGroupIds.has(
      SHARED_LESSONS.find((l) => l.id === m.lessonId)?.groupId ?? '',
    ))
    .forEach((m) => {
      if (m.title.toLowerCase().includes(q)) {
        results.push({
          id: `material-${m.id}`,
          type: 'material',
          label: m.title,
          category: m.type,
          to: ROUTES.STUDENT_MATERIALS,
        })
      }
    })

  return results.slice(0, 8)
}
