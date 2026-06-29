import { groupsApi } from '@/api/groups'
import { studentsApi } from '@/api/students'
import { lessonsApi } from '@/api/lessons'
import { materialsApi } from '@/api/materials'
import { teacherPortalApi } from '@/api/teacherPortal'
import { ROUTES } from '@/constants/routes'

export type SearchResultType = 'group' | 'student' | 'lesson' | 'material'

export interface GlobalSearchResult {
  id: string
  type: SearchResultType
  label: string
  category: string
  to: string
}

interface CachedGroup { id: number; name: string }
interface CachedStudent { id: number; name: string; surname: string; groupIds: number[] }
interface CachedLesson { id: number; groupId: number; topic: string; date: string }
interface CachedMaterial { id: number; lessonId: number; title: string; type: string }

let cachedGroups: CachedGroup[] = []
let cachedStudents: CachedStudent[] = []
let cachedLessons: CachedLesson[] = []
let cachedMaterials: CachedMaterial[] = []
let cacheLoaded = false
let cacheLoading = false
let loadPromise: Promise<void> | null = null

async function loadCache(): Promise<void> {
  if (cacheLoaded || cacheLoading) return
  cacheLoading = true
  try {
    const [groupsRes, studentsRes] = await Promise.all([
      groupsApi.list().catch(() => ({ data: [] as any[] })),
      studentsApi.list().catch(() => ({ data: [] as any[] })),
    ])

    const groups = groupsRes.data ?? []
    cachedGroups = groups.map((g: any) => ({ id: g.id, name: g.name }))

    const students = studentsRes.data ?? []
    cachedStudents = students.map((s: any) => ({
      id: s.id,
      name: s.name,
      surname: s.surname,
      groupIds: s.groupIds ?? s.group_ids ?? [],
    }))

    const lessonsResults = await Promise.all(
      groups.map((g: any) => lessonsApi.getByGroup(g.id).catch(() => [] as any[])),
    )
    const lessons = lessonsResults.flat()
    cachedLessons = lessons.map((l: any) => ({
      id: l.id,
      groupId: l.group_id,
      topic: l.topic,
      date: l.lesson_date,
    }))

    const materialsResults = await Promise.all(
      cachedLessons.map((l) => materialsApi.getByLesson(l.id).catch(() => [] as any[])),
    )
    const materials = materialsResults.flat().filter(Boolean)
    cachedMaterials = materials.map((m: any) => ({
      id: m.id,
      lessonId: m.lesson_id ?? m.lessonId,
      title: m.title,
      type: m.type,
    }))

    cacheLoaded = true
  } catch {
    // silent fail — search will return empty
  } finally {
    cacheLoading = false
  }
}

loadPromise = loadCache()

export function initSearchCache(): Promise<void> {
  if (cacheLoaded) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = loadCache()
  return loadPromise
}

export function searchGlobal(query: string): GlobalSearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1 || !cacheLoaded) return []

  initSearchCache()

  const results: GlobalSearchResult[] = []

  for (const g of cachedGroups) {
    if (g.name.toLowerCase().includes(q)) {
      results.push({
        id: `group-${g.id}`,
        type: 'group',
        label: g.name,
        category: 'Qrup',
        to: ROUTES.TEACHER_GROUP(String(g.id)),
      })
    }
  }

  for (const s of cachedStudents) {
    const full = `${s.name} ${s.surname}`.toLowerCase()
    if (full.includes(q)) {
      results.push({
        id: `student-${s.id}`,
        type: 'student',
        label: `${s.name} ${s.surname}`,
        category: 'Tələbə',
        to: ROUTES.TEACHER_GROUPS,
      })
    }
  }

  for (const l of cachedLessons) {
    if (l.topic.toLowerCase().includes(q) || l.date.includes(q)) {
      const group = cachedGroups.find((g) => g.id === l.groupId)
      results.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        label: `${l.topic} — ${l.date}`,
        category: group?.name ?? 'Dərs',
        to: ROUTES.TEACHER_JOURNAL,
      })
    }
  }

  for (const m of cachedMaterials) {
    if (m.title.toLowerCase().includes(q)) {
      results.push({
        id: `material-${m.id}`,
        type: 'material',
        label: m.title,
        category: m.type,
        to: ROUTES.TEACHER_MATERIAL,
      })
    }
  }

  return results.slice(0, 20)
}

export function searchGlobalStudent(query: string, _studentId?: string): GlobalSearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1 || !cacheLoaded) return []

  initSearchCache()

  const results: GlobalSearchResult[] = []

  for (const s of cachedStudents) {
    const full = `${s.name} ${s.surname}`.toLowerCase()
    if (full.includes(q)) {
      results.push({
        id: `student-${s.id}`,
        type: 'student',
        label: `${s.name} ${s.surname}`,
        category: 'Tələbə',
        to: ROUTES.STUDENT_GROUPS,
      })
    }
  }

  for (const g of cachedGroups) {
    if (g.name.toLowerCase().includes(q)) {
      results.push({
        id: `group-${g.id}`,
        type: 'group',
        label: g.name,
        category: 'Qrup',
        to: ROUTES.STUDENT_GROUPS,
      })
    }
  }

  for (const l of cachedLessons) {
    if (l.topic.toLowerCase().includes(q) || l.date.includes(q)) {
      const group = cachedGroups.find((g) => g.id === l.groupId)
      results.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        label: `${l.topic} — ${l.date}`,
        category: group?.name ?? 'Dərs',
        to: ROUTES.STUDENT_GROUPS,
      })
    }
  }

  for (const m of cachedMaterials) {
    if (m.title.toLowerCase().includes(q)) {
      results.push({
        id: `material-${m.id}`,
        type: 'material',
        label: m.title,
        category: m.type,
        to: ROUTES.STUDENT_MATERIALS,
      })
    }
  }

  return results.slice(0, 20)
}
