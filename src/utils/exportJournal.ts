import * as XLSX from 'xlsx'
import type { AcademicState, AttendanceEntry, GradeEntry } from '../store/academicStore'
import { SHARED_LESSONS, SHARED_STUDENTS, SHARED_GROUPS } from '../store/academicStore'
import type { GradeCategory } from '../types'
import { GRADE_CATEGORY_LABELS } from '../types'

function attCodeToLabel(entry: AttendanceEntry | undefined): string {
  if (!entry) return ''
  switch (entry.status) {
    case 'present':          return 'İE'
    case 'late':
      return entry.minutesLate && entry.minutesLate > 0
        ? `G [${entry.minutesLate} dəq]`
        : 'G'
    case 'absent_excused':   return 'QÜ'
    case 'absent_unexcused': return 'Q'
    default:                 return ''
  }
}

function gradeLabel(entry: GradeEntry | undefined): string {
  if (!entry || entry.score === null || entry.score === undefined) return ''
  return String(entry.score)
}

function categoryLabel(entry: GradeEntry | undefined): string {
  if (!entry?.category) return ''
  return GRADE_CATEGORY_LABELS[entry.category as GradeCategory] ?? ''
}

function calcAvgGrade(studentId: string, lessonIds: string[], state: AcademicState): string {
  const scores = state.grades
    .filter(g => g.studentId === studentId && lessonIds.includes(g.lessonId) && g.score !== null)
    .map(g => g.score as number)
  if (scores.length === 0) return ''
  return String(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
}

export function exportJournalToExcel(
  groupId: string,
  state: AcademicState
): void {
  const group   = SHARED_GROUPS.find(g => g.id === groupId)
  const lessons = SHARED_LESSONS.filter(l => l.groupId === groupId)
  const students = SHARED_STUDENTS.filter(s => s.groupIds.includes(groupId))

  if (!group || lessons.length === 0 || students.length === 0) return

  const lessonIds = lessons.map(l => l.id)

  const lessonCategory: Record<string, string> = {}
  lessons.forEach(l => {
    const grade = state.grades.find(g => g.lessonId === l.id)
    lessonCategory[l.id] = grade?.category
      ? (GRADE_CATEGORY_LABELS[grade.category as GradeCategory] ?? '')
      : ''
  })

  const headerRow0: (string | number)[] = ['№', 'Ad Soyad']
  const headerRow1: (string | number)[] = ['',  '']
  const headerRow2: (string | number)[] = ['',  '']
  const headerRow3: (string | number)[] = ['',  '']

  lessons.forEach(l => {
    headerRow0.push(l.date, '')
    headerRow1.push(l.topic, '')
    headerRow2.push(lessonCategory[l.id], '')
    headerRow3.push('Davamiyyət', 'Bal')
  })

  const umumiCol = 2 + lessons.length * 2

  headerRow0.push('Ümumi %')
  headerRow1.push('')
  headerRow2.push('')
  headerRow3.push('')

  const dataRows = students.map((student, idx) => {
    const row: (string | number)[] = [
      idx + 1,
      `${student.studentName} ${student.studentSurname}`,
    ]

    lessons.forEach(lesson => {
      const attEntry = state.attendance.find(
        a => a.lessonId === lesson.id && a.studentId === student.studentId
      )
      const grEntry = state.grades.find(
        g => g.lessonId === lesson.id && g.studentId === student.studentId
      )

      row.push(
        attCodeToLabel(attEntry),
        gradeLabel(grEntry),
      )
    })

    row.push(calcAvgGrade(student.studentId, lessonIds, state))
    return row
  })

  const wsData = [headerRow0, headerRow1, headerRow2, headerRow3, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = [
    { wch: 4  },
    { wch: 24 },
    ...lessons.flatMap(() => [
      { wch: 16 },
      { wch: 8  },
    ]),
    { wch: 12 },
  ]

  const merges: XLSX.Range[] = []

  merges.push({ s: { r:0, c:0 }, e: { r:3, c:0 } })
  merges.push({ s: { r:0, c:1 }, e: { r:3, c:1 } })
  merges.push({ s: { r:0, c:umumiCol }, e: { r:3, c:umumiCol } })

  lessons.forEach((_, lessonIdx) => {
    const col = 2 + lessonIdx * 2
    merges.push({ s: { r:0, c:col }, e: { r:0, c:col+1 } })
    merges.push({ s: { r:1, c:col }, e: { r:1, c:col+1 } })
    merges.push({ s: { r:2, c:col }, e: { r:2, c:col+1 } })
  })

  ws['!merges'] = merges

  for (let r = 0; r <= 3; r++) {
    for (let c = 0; c <= umumiCol; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
        }
      }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, group.name)

  const fileName = `${group.name}_Jurnal_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
}
