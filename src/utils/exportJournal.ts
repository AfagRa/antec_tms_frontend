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

export function exportJournalToExcel(
  groupId: string,
  state: AcademicState
): void {
  const group   = SHARED_GROUPS.find(g => g.id === groupId)
  const lessons = SHARED_LESSONS.filter(l => l.groupId === groupId)
  const students = SHARED_STUDENTS.filter(s => s.groupIds.includes(groupId))

  if (!group || lessons.length === 0 || students.length === 0) return

  const headerRow1: (string | number)[] = ['№', 'Ad Soyad']
  const headerRow2: (string | number)[] = ['',  '']
  const headerRow3: (string | number)[] = ['',  '']

  lessons.forEach(l => {
    headerRow1.push(l.date, '')
    headerRow2.push(l.topic, '')
    headerRow3.push('Davamiyyət', 'Bal')
  })

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

    return row
  })

  const wsData = [headerRow1, headerRow2, headerRow3, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = [
    { wch: 4  },
    { wch: 24 },
    ...lessons.flatMap(() => [
      { wch: 16 },
      { wch: 8  },
    ])
  ]

  const merges: XLSX.Range[] = []

  merges.push({ s: { r:0, c:0 }, e: { r:2, c:0 } })
  merges.push({ s: { r:0, c:1 }, e: { r:2, c:1 } })

  lessons.forEach((_, lessonIdx) => {
    const col = 2 + lessonIdx * 2
    merges.push({ s: { r:0, c:col }, e: { r:0, c:col+1 } })
    merges.push({ s: { r:1, c:col }, e: { r:1, c:col+1 } })
  })

  ws['!merges'] = merges

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, group.name)

  const fileName = `${group.name}_Jurnal_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
}
