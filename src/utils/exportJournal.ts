import * as XLSX from 'xlsx'
import type { GroupStudent, GroupLessonItem } from '../types'
import { GRADE_CATEGORY_LABELS } from '../types'
import type { GradeCategory } from '../types'

interface CellData {
  attStatus: string | null
  minutesLate: number
  grade: number | null
}

function attCodeToLabel(attStatus: string | null, minutesLate: number): string {
  switch (attStatus) {
    case 'I/E': return 'İE'
    case 'G':
      return minutesLate > 0 ? `G [${minutesLate} dəq]` : 'G'
    case 'QÜ':  return 'QÜ'
    case 'Q':   return 'Q'
    default:    return ''
  }
}

function calcAvg(studentId: number, visibleLessonIds: number[], matrix: Record<number, Record<number, CellData>>): string {
  const scores = visibleLessonIds
    .map(lid => matrix[studentId]?.[lid]?.grade)
    .filter((g): g is number => g !== null)
  if (scores.length === 0) return ''
  return String(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
}

export function exportJournalToExcel(
  groupName: string,
  students: GroupStudent[],
  allLessons: GroupLessonItem[],
  matrix: Record<number, Record<number, CellData>>,
  columnCategories: Record<number, string>,
  selectedCategory: string,
): void {
  const lessons = allLessons.filter(l => (columnCategories[l.id] ?? 'ders') === selectedCategory)
  if (lessons.length === 0 || students.length === 0) return

  const visibleLessonIds = lessons.map(l => l.id)

  const headerRow0: (string | number)[] = ['№', 'Ad Soyad']
  const headerRow1: (string | number)[] = ['',  '']
  const headerRow2: (string | number)[] = ['',  '']
  const headerRow3: (string | number)[] = ['',  '']

  lessons.forEach(l => {
    const cat = (columnCategories[l.id] ?? 'ders') as GradeCategory
    headerRow0.push(l.lesson_date, '')
    headerRow1.push(l.topic, '')
    headerRow2.push(GRADE_CATEGORY_LABELS[cat] ?? '', '')
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
      `${student.name} ${student.surname}`,
    ]
    lessons.forEach(lesson => {
      const cell = matrix[student.id]?.[lesson.id]
      row.push(
        attCodeToLabel(cell?.attStatus ?? null, cell?.minutesLate ?? 0),
        cell?.grade !== null && cell?.grade !== undefined ? String(cell.grade) : '',
      )
    })
    row.push(calcAvg(student.id, visibleLessonIds, matrix))
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
  XLSX.utils.book_append_sheet(wb, ws, groupName)

  const fileName = `${groupName}_Jurnal_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
}
