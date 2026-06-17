import { ROUTES } from '../constants/routes'

interface SearchGroup { id: string; name: string }
interface SearchStudent { userId: number; studentId: string; studentName: string; studentSurname: string; groupIds: string[] }
interface SearchLesson { id: string; groupId: string; date: string; topic: string }
interface SearchMaterial { id: string; lessonId: string; title: string; type: string; url: string }

const SHARED_GROUPS: SearchGroup[] = [
  { id: '1', name: 'Python-A1' }, { id: '2', name: 'Code-A2' }, { id: '3', name: 'JS-B1' },
]
const SHARED_STUDENTS: SearchStudent[] = [
  { userId: 3, studentId: 's1', studentName: 'Əli', studentSurname: 'Məmmədov', groupIds: ['1', '2'] },
  { userId: 4, studentId: 's2', studentName: 'Sona', studentSurname: 'Quliyeva', groupIds: ['1'] },
  { userId: 5, studentId: 's3', studentName: 'Orxan', studentSurname: 'Rəsulov', groupIds: ['1'] },
  { userId: 6, studentId: 's4', studentName: 'Vüsal', studentSurname: 'Qəfarov', groupIds: ['1'] },
  { userId: 7, studentId: 's5', studentName: 'Leyla', studentSurname: 'Əliyeva', groupIds: ['1'] },
  { userId: 8, studentId: 's6', studentName: 'Murad', studentSurname: 'Həsənov', groupIds: ['1'] },
  { userId: 9, studentId: 's7', studentName: 'Nigar', studentSurname: 'Babayeva', groupIds: ['2'] },
  { userId: 10, studentId: 's8', studentName: 'Rauf', studentSurname: 'İsmayılov', groupIds: ['2'] },
  { userId: 11, studentId: 's9', studentName: 'Könül', studentSurname: 'Nəsirov', groupIds: ['3'] },
  { userId: 12, studentId: 's10', studentName: 'Tural', studentSurname: 'Qədirov', groupIds: ['3'] },
]
const SHARED_LESSONS: SearchLesson[] = [
  { id: 'l1', groupId: '1', date: '01.06.2026', topic: 'Giriş' },
  { id: 'l2', groupId: '1', date: '03.06.2026', topic: 'Dəyişənlər' },
  { id: 'l3', groupId: '1', date: '06.06.2026', topic: 'Massivlər' },
  { id: 'l4', groupId: '1', date: '08.06.2026', topic: 'Funksiyalar' },
  { id: 'l5', groupId: '1', date: '10.06.2026', topic: 'Döngülər' },
  { id: 'l6', groupId: '2', date: '02.06.2026', topic: 'HTML Əsasları' },
  { id: 'l7', groupId: '2', date: '05.06.2026', topic: 'CSS Flex' },
  { id: 'l8', groupId: '2', date: '09.06.2026', topic: 'JS Giriş' },
  { id: 'l9', groupId: '3', date: '04.06.2026', topic: 'Dəyişənlər' },
  { id: 'l10', groupId: '3', date: '07.06.2026', topic: 'Funksiyalar' },
]
const SHARED_MATERIALS: SearchMaterial[] = [
  { id:'m1', lessonId:'l1', title:'Dərs 01 - Giriş Konspekti', type:'Fayl', url:'#' },
  { id:'m2', lessonId:'l2', title:'Dəyişənlər - Videodərs', type:'YouTube', url:'https://youtube.com' },
  { id:'m3', lessonId:'l3', title:'Massivlər Sənədi', type:'Google Drive', url:'https://drive.google.com' },
  { id:'m4', lessonId:'l4', title:'Funksiyalar - Faydalı Keçidlər', type:'Linklər', url:'https://python.org' },
  { id:'m5', lessonId:'l5', title:'Döngülər Konspekti', type:'Fayl', url:'#' },
  { id:'m6', lessonId:'l6', title:'HTML Əsasları - Slaydlar', type:'Fayl', url:'#' },
  { id:'m7', lessonId:'l7', title:'CSS Flex - Praktiki Tapşırıq', type:'Google Drive', url:'https://drive.google.com' },
  { id:'m8', lessonId:'l9', title:'JS-B1 Dərs Materialları', type:'YouTube', url:'https://youtube.com' },
]

export function resolveStudentId(userId?: number): string {
  if (!userId) return 's1'
  return SHARED_STUDENTS.find((s) => s.userId === userId)?.studentId ?? 's1'
}

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
